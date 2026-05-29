export default function OfferLetterTemplate({ data, settings }) {
  const company = settings?.companyName || import.meta.env.VITE_COMPANY_NAME || 'Your Startup';
  return (
    <div
      style={{
        width: 794,
        height: 1123,
        padding: 48,
        fontFamily: 'Georgia, serif',
        background: '#fff',
        color: '#1E3A5F',
        boxSizing: 'border-box',
      }}
    >
      {settings?.logoUrl && (
        <img src={settings.logoUrl} alt="" style={{ height: 48, marginBottom: 24 }} />
      )}
      <h1 style={{ fontSize: 24, marginBottom: 8 }}>{company}</h1>
      <p style={{ fontSize: 12, color: '#64748b', marginBottom: 32 }}>
        {settings?.address || 'Registered Office Address'}
      </p>
      <p style={{ fontSize: 14, marginBottom: 24 }}>{new Date().toLocaleDateString('en-IN')}</p>
      <p style={{ fontSize: 14, lineHeight: 1.6 }}>
        Dear <strong>{data.internName}</strong>,
      </p>
      <p style={{ fontSize: 14, lineHeight: 1.8, marginTop: 16 }}>
        We are pleased to offer you an internship position as{' '}
        <strong>{data.role}</strong> in the <strong>{data.department}</strong> department at{' '}
        {company}. Your internship will run from{' '}
        <strong>{data.startDate}</strong> to <strong>{data.endDate}</strong>.
        {data.stipend && (
          <>
            {' '}
            Stipend: <strong>{data.stipend}</strong> per month.
          </>
        )}
      </p>
      <p style={{ fontSize: 14, lineHeight: 1.8, marginTop: 16 }}>
        We look forward to your contributions. Please report to your team lead upon joining.
      </p>
      <p style={{ fontSize: 14, marginTop: 48 }}>Sincerely,</p>
      <p style={{ fontSize: 14, fontWeight: 'bold' }}>Authorized Signatory</p>
      <p style={{ fontSize: 12, fontFamily: 'monospace', marginTop: 32, color: '#64748b' }}>
        Ref: {data.id}
      </p>
    </div>
  );
}
