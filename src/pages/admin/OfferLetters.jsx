import { useEffect, useState, useRef } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import Button from '../../components/common/Button';
import OfferLetterTemplate from '../../components/documents/OfferLetterTemplate';
import { getAllUsers } from '../../services/userService';
import { getSettings } from '../../services/settingsService';
import { createOfferLetter } from '../../services/offerLetterService';
import { uploadFile } from '../../services/storageService';
import { captureElementToPdf, downloadBlob } from '../../utils/pdfUtils';
import { formatDate } from '../../utils/dateUtils';
import { ROLES } from '../../constants/roles';
import { useAuth } from '../../hooks/useAuth';
import { useUiStore } from '../../store/uiStore';

export default function OfferLetters() {
  const { user } = useAuth();
  const addToast = useUiStore((s) => s.addToast);
  const templateRef = useRef();
  const [interns, setInterns] = useState([]);
  const [selected, setSelected] = useState('');
  const [settings, setSettings] = useState({});
  const [letterData, setLetterData] = useState(null);

  useEffect(() => {
    getAllUsers(ROLES.INTERN).then(setInterns);
    getSettings().then(setSettings);
  }, []);

  const intern = interns.find((i) => i.uid === selected);

  const buildData = () => ({
    id: `OL-2025-${String(Math.floor(Math.random() * 9000) + 1000)}`,
    internName: intern.name,
    role: intern.role || 'Intern',
    department: intern.department,
    startDate: formatDate(intern.startDate),
    endDate: formatDate(intern.endDate),
    stipend: intern.stipend || '',
  });

  const generate = async () => {
    if (!intern) return;
    const data = buildData();
    setLetterData(data);
    await new Promise((r) => setTimeout(r, 100));
    const { blob } = await captureElementToPdf(templateRef.current, `${data.id}.pdf`);
    const pdfUrl = await uploadFile(`documents/offer/${data.id}.pdf`, blob);
    await createOfferLetter({
      ...data,
      internUid: intern.uid,
      startDate: intern.startDate,
      endDate: intern.endDate,
      generatedBy: user.uid,
      pdfUrl,
    });
    addToast('Offer letter generated');
    downloadBlob(blob, `${data.id}.pdf`);
  };

  return (
    <PageWrapper title="Offer Letters">
      <div className="card mb-6 flex flex-wrap items-end gap-4">
        <label className="text-sm">
          Select intern
          <select className="input-field mt-1 min-w-[200px]" value={selected} onChange={(e) => setSelected(e.target.value)}>
            <option value="">Choose…</option>
            {interns.map((i) => (
              <option key={i.uid} value={i.uid}>{i.name}</option>
            ))}
          </select>
        </label>
        <Button onClick={generate} disabled={!selected}>Generate PDF</Button>
      </div>
      <div className="overflow-hidden" style={{ position: 'absolute', left: -9999 }}>
        <div ref={templateRef}>
          {letterData && <OfferLetterTemplate data={letterData} settings={settings} />}
        </div>
      </div>
    </PageWrapper>
  );
}
