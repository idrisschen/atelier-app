// Dates en heure locale, au format AAAA-MM-JJ (jamais toISOString : il passe en UTC).

export const jourIso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export const today = () => jourIso(new Date());

export const ajouteJours = (iso: string, n: number) => {
  const [y, m, d] = iso.split('-').map(Number);
  return jourIso(new Date(y, m - 1, d + n));
};

export const ecartJours = (de: string, a: string) => {
  const [y1, m1, d1] = de.split('-').map(Number);
  const [y2, m2, d2] = a.split('-').map(Number);
  return Math.round((new Date(y2, m2 - 1, d2).getTime() - new Date(y1, m1 - 1, d1).getTime()) / 86_400_000);
};

// Lundi de la semaine de `iso`.
export const debutSemaine = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  const jour = new Date(y, m - 1, d).getDay();
  return ajouteJours(iso, -((jour + 6) % 7));
};

export const dateCourte = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
};

export const newId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
