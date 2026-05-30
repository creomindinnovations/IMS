import { useEffect, useState, useRef } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import CertificateTemplate from '../../components/documents/CertificateTemplate';
import Modal from '../../components/common/Modal';
import { getAllUsers } from '../../services/userService';
import { getAllCertificates, createCertificate, approveCertificate, updateCertificatePdf } from '../../services/certificateService';
import { getSettings } from '../../services/settingsService';
import { generateQRDataUrl } from '../../utils/qrUtils';
import { captureElementToPdf } from '../../utils/pdfUtils';
import { uploadFile } from '../../services/storageService';
import { formatDate } from '../../utils/dateUtils';
import { ROLES } from '../../constants/roles';
import { useAuth } from '../../hooks/useAuth';
import { useUiStore } from '../../store/uiStore';

export default function Certificates() {
  const { user } = useAuth();
  const addToast = useUiStore((s) => s.addToast);
  const templateRef = useRef();
  const [interns, setInterns] = useState([]);
  const [certs, setCerts] = useState([]);
  const [settings, setSettings] = useState({});
  const [preview, setPreview] = useState(null);
  const [qrUrl, setQrUrl] = useState('');
  const [form, setForm] = useState({ internUid: '', type: 'completion' });

  const load = async () => {
    const [i, c, s] = await Promise.all([
      getAllUsers(ROLES.INTERN),
      getAllCertificates(),
      getSettings(),
    ]);
    setInterns(i);
    setCerts(c);
    setSettings(s);
  };

  useEffect(() => { load(); }, []);

  const intern = interns.find((x) => x.uid === form.internUid);

  const handleCreate = async () => {
    if (!intern) return;
    const { id, certId } = await createCertificate({
      internUid: intern.uid,
      internName: intern.name,
      type: form.type,
      role: intern.role || 'Intern',
      department: intern.department,
      startDate: intern.startDate,
      endDate: intern.endDate,
    });
    addToast('Certificate created (pending)');
    load();
    setPreview({ id, certId, intern });
  };

  const handleApprove = async () => {
    if (!preview) return;
    const data = {
      certId: preview.certId,
      internName: preview.intern.name,
      type: form.type,
      role: preview.intern.role || 'Intern',
      department: preview.intern.department,
      startDate: formatDate(preview.intern.startDate),
      endDate: formatDate(preview.intern.endDate),
    };
    const qr = await generateQRDataUrl(
      `${import.meta.env.VITE_CERT_VERIFY_BASE_URL || window.location.origin}/verify/${preview.certId}`,
    );
    setQrUrl(qr);
    await new Promise((r) => setTimeout(r, 150));
    const { blob } = await captureElementToPdf(templateRef.current);
    const pdfUrl = await uploadFile(`documents/cert/${preview.certId}.pdf`, blob);
    await approveCertificate(preview.id, user.uid);
    await updateCertificatePdf(preview.id, pdfUrl);
    addToast('Certificate approved');
    setPreview(null);
    load();
  };

  return (
    <PageWrapper title="Certificates">
      <div className="card mb-6 flex flex-wrap gap-4">
        <select className="input-field" value={form.internUid} onChange={(e) => setForm({ ...form, internUid: e.target.value })}>
          <option value="">Select intern</option>
          {interns.map((i) => (
            <option key={i.uid} value={i.uid}>{i.name}</option>
          ))}
        </select>
        <select className="input-field" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
          <option value="completion">Completion</option>
          <option value="recommendation">Letter of Recommendation</option>
        </select>
        <Button onClick={handleCreate}>Generate request</Button>
      </div>

      <ul className="space-y-2">
        {certs.map((c) => (
          <li key={c.id} className="card flex items-center justify-between">
            <span className="font-mono text-sm">{c.certId}</span>
            <Badge status={c.status} />
            {c.status === 'pending' && (
              <Button onClick={() => setPreview({ id: c.id, certId: c.certId, intern: interns.find((i) => i.uid === c.internUid) })}>
                Approve
              </Button>
            )}
          </li>
        ))}
      </ul>

      <Modal open={Boolean(preview)} onClose={() => setPreview(null)} title="Approve certificate" wide>
        <Button onClick={handleApprove}>Approve &amp; Publish</Button>
      </Modal>

      <div style={{ position: 'absolute', left: -9999 }}>
        <div ref={templateRef}>
          {preview && (
            <CertificateTemplate
              data={{
                certId: preview.certId,
                internName: preview.intern?.name,
                type: form.type,
                role: preview.intern?.role || 'Intern',
                department: preview.intern?.department,
                startDate: formatDate(preview.intern?.startDate),
                endDate: formatDate(preview.intern?.endDate),
              }}
              qrDataUrl={qrUrl}
              settings={settings}
            />
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
