import QRCode from 'qrcode';

export async function generateQRDataUrl(text) {
  return QRCode.toDataURL(text, {
    width: 120,
    margin: 1,
    color: { dark: '#1E3A5F', light: '#FFFFFF' },
  });
}

export function getVerifyUrl(certId) {
  const base = import.meta.env.VITE_CERT_VERIFY_BASE_URL || `${window.location.origin}/verify`;
  return `${base.replace(/\/$/, '')}/${certId}`;
}
