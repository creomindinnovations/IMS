/**
 * Migrate IMS data from an old Firebase project to a new one.
 *
 * Prerequisites:
 * - config.json (copy from config.example.json)
 * - Service account JSON keys for BOTH projects in keys/
 * - Firebase CLI logged in (for auth export/import)
 *
 * Order: Auth → Storage → Firestore (URLs rewritten to new bucket)
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { initializeApp, cert, getApps, deleteApp } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

const __dirname = dirname(fileURLToPath(import.meta.url));

const COLLECTIONS = [
  'users',
  'attendance',
  'tutorials',
  'progress',
  'leave_requests',
  'offer_letters',
  'certificates',
  'announcements',
  'settings',
];

const BATCH_SIZE = 400;

const args = process.argv.slice(2);
const firestoreOnly = args.includes('--firestore-only');
const storageOnly = args.includes('--storage-only');
const authOnly = args.includes('--auth-only');
const dryRun = args.includes('--dry-run');

function loadConfig() {
  const configPath = resolve(__dirname, 'config.json');
  if (!existsSync(configPath)) {
    console.error('Missing config.json. Copy config.example.json → config.json and fill in paths.');
    process.exit(1);
  }
  return JSON.parse(readFileSync(configPath, 'utf8'));
}

function loadServiceAccount(relativePath) {
  const path = resolve(__dirname, relativePath);
  if (!existsSync(path)) {
    console.error(`Service account not found: ${path}`);
    process.exit(1);
  }
  return JSON.parse(readFileSync(path, 'utf8'));
}

function initApps(config) {
  const oldCreds = loadServiceAccount(config.old.serviceAccount);
  const newCreds = loadServiceAccount(config.new.serviceAccount);

  const oldApp = initializeApp(
    {
      credential: cert(oldCreds),
      projectId: config.old.projectId,
      storageBucket: config.old.storageBucket,
    },
    'old',
  );

  const newApp = initializeApp(
    {
      credential: cert(newCreds),
      projectId: config.new.projectId,
      storageBucket: config.new.storageBucket,
    },
    'new',
  );

  return { oldApp, newApp };
}

function rewriteBucketInValue(value, oldBucket, newBucket, oldProjectId, newProjectId) {
  if (value instanceof Timestamp) return value;
  if (typeof value === 'string') {
    let s = value;
    if (oldBucket && newBucket) {
      s = s.split(oldBucket).join(newBucket);
      s = s.split(`${oldProjectId}.appspot.com`).join(`${newProjectId}.appspot.com`);
    }
    if (oldProjectId && newProjectId) {
      s = s.split(`/b/${oldProjectId}.`).join(`/b/${newProjectId}.`);
      s = s.split(`%2F${oldProjectId}%2F`).join(`%2F${newProjectId}%2F`);
    }
    return s;
  }
  if (Array.isArray(value)) {
    return value.map((v) =>
      rewriteBucketInValue(v, oldBucket, newBucket, oldProjectId, newProjectId),
    );
  }
  if (value && typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = rewriteBucketInValue(v, oldBucket, newBucket, oldProjectId, newProjectId);
    }
    return out;
  }
  return value;
}

async function migrateFirestore(config) {
  const { oldApp, newApp } = initApps(config);
  const oldDb = getFirestore(oldApp);
  const newDb = getFirestore(newApp);

  const { old: oldCfg, new: newCfg } = config;

  for (const collectionName of COLLECTIONS) {
    const snap = await oldDb.collection(collectionName).get();
    if (snap.empty) {
      console.log(`  ${collectionName}: (empty)`);
      continue;
    }

    if (dryRun) {
      console.log(`  ${collectionName}: would copy ${snap.size} document(s)`);
      continue;
    }

    let batch = newDb.batch();
    let inBatch = 0;
    let total = 0;

    for (const docSnap of snap.docs) {
      const data = rewriteBucketInValue(
        docSnap.data(),
        oldCfg.storageBucket,
        newCfg.storageBucket,
        oldCfg.projectId,
        newCfg.projectId,
      );
      batch.set(newDb.collection(collectionName).doc(docSnap.id), data);
      inBatch += 1;
      total += 1;

      if (inBatch >= BATCH_SIZE) {
        await batch.commit();
        batch = newDb.batch();
        inBatch = 0;
      }
    }

    if (inBatch > 0) await batch.commit();
    console.log(`  ${collectionName}: copied ${total} document(s)`);
  }

  await cleanupApps();
}

async function migrateStorage(config) {
  const { oldApp, newApp } = initApps(config);
  const oldBucket = getStorage(oldApp).bucket();
  const newBucket = getStorage(newApp).bucket();

  const [files] = await oldBucket.getFiles();

  if (files.length === 0) {
    console.log('  Storage: no files in old bucket');
    await cleanupApps();
    return;
  }

  if (dryRun) {
    console.log(`  Storage: would copy ${files.length} file(s)`);
    await cleanupApps();
    return;
  }

  let copied = 0;
  let failed = 0;

  for (const file of files) {
    try {
      const dest = newBucket.file(file.name);
      const [exists] = await dest.exists();
      if (exists) {
        console.log(`  skip (exists): ${file.name}`);
        continue;
      }
      await file.copy(dest);
      copied += 1;
      if (copied % 10 === 0) console.log(`  copied ${copied}/${files.length}...`);
    } catch (err) {
      failed += 1;
      console.error(`  failed: ${file.name} — ${err.message}`);
    }
  }

  console.log(`  Storage: copied ${copied}, failed ${failed}, total ${files.length}`);
  await cleanupApps();
}

function runAuthMigration(config) {
  const exportPath = resolve(__dirname, 'auth-export.json');
  const oldProject = config.old.projectId;
  const newProject = config.new.projectId;

  console.log('\n--- Auth migration (Firebase CLI) ---');
  console.log(`Exporting users from: ${oldProject}`);

  const exportCmd = spawnSync(
    'firebase',
    ['auth:export', exportPath, '--format=json', '--project', oldProject],
    { stdio: 'inherit', shell: true },
  );

  if (exportCmd.status !== 0) {
    console.error(
      '\nAuth export failed. Install firebase-tools, run firebase login, and ensure you have access to the old project.',
    );
    process.exit(exportCmd.status ?? 1);
  }

  if (dryRun) {
    console.log(`Dry run: would import users into ${newProject} from ${exportPath}`);
    return;
  }

  console.log(`Importing users into: ${newProject}`);
  console.log('(Passwords are preserved when export includes hash data.)\n');

  const importCmd = spawnSync(
    'firebase',
    ['auth:import', exportPath, '--project', newProject],
    { stdio: 'inherit', shell: true },
  );

  if (importCmd.status !== 0) {
    console.error('\nAuth import failed. See Firebase CLI output above.');
    process.exit(importCmd.status ?? 1);
  }

  console.log('\nAuth migration complete. User UIDs match the old project.');
}

async function cleanupApps() {
  for (const app of getApps()) {
    await deleteApp(app);
  }
}

async function main() {
  const config = loadConfig();

  console.log('IMS Firebase migration');
  console.log(`  Old: ${config.old.projectId}`);
  console.log(`  New: ${config.new.projectId}`);
  if (dryRun) console.log('  Mode: DRY RUN (no writes)\n');

  const runAll = !firestoreOnly && !storageOnly && !authOnly;

  if (runAll || authOnly) {
    runAuthMigration(config);
  }

  if (runAll || storageOnly) {
    console.log('\n--- Storage migration ---');
    await migrateStorage(config);
  }

  if (runAll || firestoreOnly) {
    console.log('\n--- Firestore migration ---');
    await migrateFirestore(config);
  }

  console.log('\nDone.');
  if (runAll || firestoreOnly) {
    console.log('\nNext steps:');
    console.log('  1. Deploy rules to the new project: firebase deploy --only firestore:rules,firestore:indexes,storage');
    console.log('  2. Confirm .env points at the NEW project and restart npm run dev');
    console.log('  3. Log in with an existing user email/password and verify data');
    console.log('  4. If tutorial PDFs/videos fail to load, re-upload those files or run storage URL refresh');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
