// Contact destinations published on Meatfish's own partnership and supplier pages.
export const whatsappContacts: Record<string, string> = {
  umum: 'https://wa.link/89ffhn',
  b2b: 'https://wa.link/89ffhn',
  kemitraan: 'https://wa.link/7ef1rr',
  'paket-minimarket': 'https://wa.link/pqyza7',
  'paket-medium': 'https://wa.link/vxlric',
  'paket-premium': 'https://wa.link/j88zym',
  supplier: 'https://wa.link/89ffhn',
  'supplier-bumbu': 'https://wa.link/nyd4p8',
  'supplier-olahan': 'https://wa.link/q18sdj',
  'supplier-protein': 'https://wa.link/4685to',
};

export function whatsappContact(purpose = 'umum'): string {
  return whatsappContacts[purpose] || whatsappContacts.umum;
}
