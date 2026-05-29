export default function CertificateTemplate({ data, qrDataUrl, settings }) {
  const company = settings?.companyName || import.meta.env.VITE_COMPANY_NAME || 'Your Startup';
  const title =
    data.type === 'appreciation'
      ? 'Certificate of Appreciation'
      : 'Certificate of Completion';

  return (
    <div
      style={{
        width: 794,
        height: 1123,
        padding: 56,
        fontFamily: 'Georgia, serif',
        background: '#fff',
        color: '#1E3A5F',
        textAlign: 'center',
        boxSizing: 'border-box',
        border: '8px solid #1E3A5F',
      }}
    >
      <p style={{ fontSize: 14, letterSpacing: 4, textTransform: 'uppercase' }}>{company}</p>
      <h1 style={{ fontSize: 32, margin: '24px 0' }}>{title}</h1>
      <p style={{ fontSize: 16 }}>This is to certify that</p>
      <h2 style={{ fontSize: 28, margin: '16px 0', color: '#2D7DD2' }}>{data.internName}</h2>
      <p style={{ fontSize: 16, lineHeight: 1.8 }}>
        has successfully completed the internship as <strong>{data.role}</strong> in{' '}
        <strong>{data.department}</strong>
        <br />
        from {data.startDate} to {data.endDate}.
      </p>
      {qrDataUrl && (
        <img src={qrDataUrl} alt="Verification QR" style={{ margin: '32px auto', width: 100 }} />
      )}
      <p style={{ fontSize: 11, fontFamily: 'monospace', color: '#64748b' }}>{data.certId}</p>
    </div>
  );
}
