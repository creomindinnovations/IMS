export const TUTORIAL_CATEGORIES = [
  { id: 'powerbi', label: 'Power BI' },
  { id: 'excel', label: 'Excel' },
  { id: 'sql', label: 'SQL' },
  { id: 'webdev', label: 'Web Development' },
  { id: 'design', label: 'Design' },
  { id: 'aitools', label: 'AI Tools' },
];

export const getCategoryLabel = (id) =>
  TUTORIAL_CATEGORIES.find((c) => c.id === id)?.label ?? id;
