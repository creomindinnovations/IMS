import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getCertificateByCertId } from '../services/certificateService';
import Badge from '../components/common/Badge';
import { formatDate } from '../utils/dateUtils';

export default function VerifyPage() {
  const { certId } = useParams();
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (certId) {
      getCertificateByCertId(certId)
        .then(setCert)
        .finally(() => setLoading(false));
    }
  }, [certId]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="card w-full max-w-md text-center">
        <h1 className="text-xl font-bold">Certificate Verification</h1>
        {loading && <p className="mt-4 text-muted">Verifying…</p>}
        {!loading && !cert && <p className="mt-4 text-error">Certificate not found.</p>}
        {!loading && cert && (
          <div className="mt-6 space-y-2 text-left text-sm">
            <p className="font-mono">{cert.certId}</p>
            <p>
              <strong>{cert.internName}</strong>
            </p>
            <p>
              {cert.role} · {cert.department}
            </p>
            <p>
              {formatDate(cert.startDate)} – {formatDate(cert.endDate)}
            </p>
            <Badge status={cert.status} />
            {cert.status === 'approved' && (
              <p className="pt-2 text-success">This certificate is valid.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
