import { useEffect, useState } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import InternDetailsView from '../../components/admin/InternDetailsView';
import { getAllUsers, createUserAccount, deactivateUser } from '../../services/userService';
import { ROLES } from '../../constants/roles';
import { useUiStore } from '../../store/uiStore';
import { formatDate } from '../../utils/dateUtils';

const emptyForm = {
  name: '',
  email: '',
  password: '',
  department: '',
  role: ROLES.INTERN,
  teamLeadId: '',
  startDate: '',
  endDate: '',
  stipend: '',
};

function generatePassword() {
  const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let pwd = '';
  for (let i = 0; i < 10; i += 1) {
    pwd += chars[Math.floor(Math.random() * chars.length)];
  }
  return pwd;
}

function teamLeadNameFor(leads, teamLeadId) {
  if (!teamLeadId) return '—';
  return leads.find((l) => l.uid === teamLeadId)?.name || '—';
}

export default function ManageInterns() {
  const addToast = useUiStore((s) => s.addToast);
  const [interns, setInterns] = useState([]);
  const [leads, setLeads] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [createdIntern, setCreatedIntern] = useState(null);
  const [selectedIntern, setSelectedIntern] = useState(null);

  const load = () => {
    getAllUsers(ROLES.INTERN).then(setInterns);
    getAllUsers(ROLES.TEAM_LEAD).then(setLeads);
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => setForm({ ...emptyForm, password: generatePassword() });

  const openCreateModal = () => {
    resetForm();
    setOpen(true);
  };

  const copyCredentials = async (email, password) => {
    const text = `IMS Login\nEmail: ${email}\nPassword: ${password}\n\nSign in at the app login page.`;
    try {
      await navigator.clipboard.writeText(text);
      addToast('Credentials copied');
    } catch {
      addToast('Could not copy to clipboard', 'error');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const password = form.password;
    const email = form.email.trim();
    try {
      const profile = await createUserAccount({
        name: form.name.trim(),
        email,
        password,
        department: form.department.trim(),
        role: ROLES.INTERN,
        teamLeadId: form.teamLeadId || null,
        startDate: form.startDate,
        endDate: form.endDate,
        stipend: form.stipend,
      });

      setOpen(false);
      setForm(emptyForm);
      setCreatedIntern({
        ...profile,
        role: ROLES.INTERN,
        loginEmail: email,
        loginPassword: password,
      });
      addToast('Intern account created');
      setInterns((prev) => [{ ...profile, role: ROLES.INTERN }, ...prev]);
      getAllUsers(ROLES.INTERN).then(setInterns).catch(() => {});
    } catch (err) {
      addToast(err.message || 'Failed to create intern', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'department', label: 'Department' },
    {
      key: 'teamLead',
      label: 'Team lead',
      render: (r) => teamLeadNameFor(leads, r.teamLeadId),
    },
    {
      key: 'dates',
      label: 'Duration',
      render: (r) => `${formatDate(r.startDate)} – ${formatDate(r.endDate)}`,
    },
    {
      key: 'status',
      label: 'Status',
      render: (r) => (
        <span className={r.isActive === false ? 'text-slate-400' : 'text-success'}>
          {r.isActive === false ? 'Inactive' : 'Active'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (r) => (
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => setSelectedIntern(r)}>
            Details
          </Button>
          {r.isActive !== false && (
            <Button
              variant="secondary"
              onClick={() =>
                deactivateUser(r.uid).then(() => {
                  addToast('Deactivated');
                  load();
                })
              }
            >
              Deactivate
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <PageWrapper title="Manage Interns">
      <p className="mb-4 text-sm text-slate-600">
        Add interns here. Each intern gets login credentials to use on the sign-in page.
      </p>
      <div className="mb-4 flex justify-end">
        <Button onClick={openCreateModal}>Add Intern</Button>
      </div>
      <DataTable columns={columns} rows={interns} rowKey="uid" />

      <Modal open={open} onClose={() => setOpen(false)} title="Add intern">
        <form onSubmit={handleCreate} className="space-y-3">
          <Input
            label="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <Input
            label="Email (login)"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <div>
            <Input
              label="Temporary password (login)"
              type="text"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              autoComplete="new-password"
            />
            <button
              type="button"
              className="mt-1 text-xs text-accent hover:underline"
              onClick={() => setForm({ ...form, password: generatePassword() })}
            >
              Generate password
            </button>
          </div>
          <Input
            label="Department"
            value={form.department}
            onChange={(e) => setForm({ ...form, department: e.target.value })}
            required
          />
          <label className="block text-sm">
            Team Lead
            <select
              className="input-field mt-1"
              value={form.teamLeadId}
              onChange={(e) => setForm({ ...form, teamLeadId: e.target.value })}
            >
              <option value="">None</option>
              {leads.map((l) => (
                <option key={l.uid} value={l.uid}>
                  {l.name}
                </option>
              ))}
            </select>
          </label>
          <Input
            label="Start date"
            type="date"
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            required
          />
          <Input
            label="End date"
            type="date"
            value={form.endDate}
            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            required
          />
          <Input
            label="Stipend (optional)"
            type="number"
            min="0"
            step="1"
            value={form.stipend}
            onChange={(e) => setForm({ ...form, stipend: e.target.value })}
          />
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? 'Creating…' : 'Create account'}
          </Button>
        </form>
      </Modal>

      <Modal
        open={Boolean(createdIntern)}
        onClose={() => setCreatedIntern(null)}
        title="Intern created"
        wide
      >
        <InternDetailsView
          intern={createdIntern}
          teamLeadName={teamLeadNameFor(leads, createdIntern?.teamLeadId)}
          loginCredentials={
            createdIntern
              ? { email: createdIntern.loginEmail, password: createdIntern.loginPassword }
              : null
          }
          onCopyCredentials={() =>
            copyCredentials(createdIntern.loginEmail, createdIntern.loginPassword)
          }
        />
        <Button className="mt-4 w-full" onClick={() => setCreatedIntern(null)}>
          Done
        </Button>
      </Modal>

      <Modal
        open={Boolean(selectedIntern)}
        onClose={() => setSelectedIntern(null)}
        title="Intern details"
        wide
      >
        <InternDetailsView
          intern={selectedIntern}
          teamLeadName={teamLeadNameFor(leads, selectedIntern?.teamLeadId)}
        />
        <p className="mt-3 text-xs text-slate-500">
          Passwords are not stored. Use Forgot password on the login page if the intern cannot sign in.
        </p>
        <Button className="mt-4 w-full" variant="secondary" onClick={() => setSelectedIntern(null)}>
          Close
        </Button>
      </Modal>
    </PageWrapper>
  );
}
