import { useEffect, useState } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import { useAuth } from '../../hooks/useAuth';
import { getOfferLettersForIntern } from '../../services/offerLetterService';
import { getCertificatesForIntern } from '../../services/certificateService';
import Badge from '../../components/common/Badge';

export default function DocumentsPage() {
  const { profile } = useAuth();
  const [letters, setLetters] = useState([]);
  const [certs, setCerts] = useState([]);

  useEffect(() => {
    if (!profile?.uid) return;
    getOfferLettersForIntern(profile.uid).then(setLetters);
    getCertificatesForIntern(profile.uid).then(setCerts);
  }, [profile?.uid]);

  return (
    <PageWrapper title="My Documents">
      <section className="card mb-6">
        <h2 className="font-semibold text-primary">Offer Letters</h2>
        {letters.length === 0 ? (
          <p className="mt-4 text-slate-500">No offer letter available yet.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {letters.map((l) => (
              <li key={l.firestoreId} className="flex items-center justify-between border-b border-border py-2">
                <span className="font-mono text-sm">{l.id}</span>
                {l.pdfUrl && (
                  <a href={l.pdfUrl} target="_blank" rel="noreferrer" className="text-accent text-sm">
                    Download PDF
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="card">
        <h2 className="font-semibold text-primary">Certificates</h2>
        {certs.length === 0 ? (
          <p className="mt-4 text-slate-500">No certificates yet.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {certs.map((c) => (
              <li key={c.id} className="flex items-center justify-between border-b border-border py-2">
                <span>
                  <span className="font-mono text-sm">{c.certId}</span>
                  <Badge status={c.status} />
                </span>
                {c.status === 'approved' && c.pdfUrl && (
                  <a href={c.pdfUrl} target="_blank" rel="noreferrer" className="text-accent text-sm">
                    Download PDF
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </PageWrapper>
  );
}
