export const ROUTES = {
  LOGIN: '/login',
  FORGOT_PASSWORD: '/forgot-password',
  ADMIN: '/admin',
  ADMIN_INTERNs: '/admin/interns',
  ADMIN_ATTENDANCE: '/admin/attendance',
  ADMIN_TUTORIALS: '/admin/tutorials',
  ADMIN_OFFER_LETTERS: '/admin/offer-letters',
  ADMIN_CERTIFICATES: '/admin/certificates',
  ADMIN_ANNOUNCEMENTS: '/admin/announcements',
  ADMIN_SETTINGS: '/admin/settings',
  ADMIN_LEAVES: '/admin/leaves',
  LEAD: '/lead',
  LEAD_ATTENDANCE: '/lead/attendance',
  INTERN: '/intern',
  INTERN_ATTENDANCE: '/intern/attendance',
  INTERN_TUTORIALS: '/intern/tutorials',
  INTERN_DOCUMENTS: '/intern/documents',
  INTERN_LEAVE: '/intern/leave',
  VERIFY: '/verify/:certId',
};

export const ROLE_HOME = {
  admin: ROUTES.ADMIN,
  teamlead: ROUTES.LEAD,
  intern: ROUTES.INTERN,
};
