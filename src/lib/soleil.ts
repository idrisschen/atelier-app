// Heures de lumière (golden hour, heure bleue) pour une date et une position, sans réseau.
// Algorithme de position solaire de SunCalc (V. Agafonkin, BSD) réduit à ce dont l'app a besoin.
const RAD = Math.PI / 180;
const J1970 = 2440588;
const J2000 = 2451545;
const J0 = 0.0009;
const E = RAD * 23.4397;

const toJulian = (d: Date) => d.getTime() / 86_400_000 - 0.5 + J1970;
const fromJulian = (j: number) => new Date((j + 0.5 - J1970) * 86_400_000);
const toDays = (d: Date) => toJulian(d) - J2000;

const anomalie = (d: number) => RAD * (357.5291 + 0.98560028 * d);
const longitudeEcliptique = (M: number) =>
  M + RAD * (1.9148 * Math.sin(M) + 0.02 * Math.sin(2 * M) + 0.0003 * Math.sin(3 * M)) + RAD * 102.9372 + Math.PI;
const declinaison = (L: number) => Math.asin(Math.sin(E) * Math.sin(L));

const cycleJulien = (d: number, lw: number) => Math.round(d - J0 - lw / (2 * Math.PI));
const transitApprox = (Ht: number, lw: number, n: number) => J0 + (Ht + lw) / (2 * Math.PI) + n;
const transitSolaire = (ds: number, M: number, L: number) => J2000 + ds + 0.0053 * Math.sin(M) - 0.0069 * Math.sin(2 * L);
const angleHoraire = (h: number, phi: number, dec: number) =>
  Math.acos((Math.sin(h) - Math.sin(phi) * Math.sin(dec)) / (Math.cos(phi) * Math.cos(dec)));

// Heure (matin, soir) où le soleil passe à `hauteur` degrés. null si ça n'arrive pas ce jour-là (été polaire…).
function passage(date: Date, lat: number, lon: number, hauteur: number): [Date, Date] | null {
  const lw = RAD * -lon;
  const phi = RAD * lat;
  const d = toDays(date);
  const n = cycleJulien(d, lw);
  const ds = transitApprox(0, lw, n);
  const M = anomalie(ds);
  const L = longitudeEcliptique(M);
  const dec = declinaison(L);
  const Jnoon = transitSolaire(ds, M, L);
  const w = angleHoraire(hauteur * RAD, phi, dec);
  if (Number.isNaN(w)) return null;
  const Jset = transitSolaire(transitApprox(w, lw, n), M, L);
  return [fromJulian(Jnoon - (Jset - Jnoon)), fromJulian(Jset)];
}

export type Lumiere = { debut: Date; fin: Date; nom: string; type: 'golden' | 'bleue' };

// Les créneaux de la journée : heure bleue (-6° → -4°) puis golden hour (-4° → 6°), le matin et le soir.
export function lumieresDuJour(date: Date, lat: number, lon: number): Lumiere[] {
  const midi = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12);
  const m6 = passage(midi, lat, lon, -6);
  const m4 = passage(midi, lat, lon, -4);
  const p6 = passage(midi, lat, lon, 6);
  if (!m6 || !m4 || !p6) return [];
  return [
    { debut: m6[0], fin: m4[0], nom: 'Heure bleue du matin', type: 'bleue' },
    { debut: m4[0], fin: p6[0], nom: 'Golden hour du matin', type: 'golden' },
    { debut: p6[1], fin: m4[1], nom: 'Golden hour du soir', type: 'golden' },
    { debut: m4[1], fin: m6[1], nom: 'Heure bleue du soir', type: 'bleue' },
  ];
}

// Le créneau en cours ou le prochain, aujourd'hui puis demain.
export function prochaineLumiere(maintenant: Date, lat: number, lon: number) {
  const demain = new Date(maintenant.getFullYear(), maintenant.getMonth(), maintenant.getDate() + 1);
  const tous = [...lumieresDuJour(maintenant, lat, lon), ...lumieresDuJour(demain, lat, lon)];
  const l = tous.find((x) => x.fin > maintenant);
  if (!l) return null;
  const enCours = l.debut <= maintenant;
  const minutes = Math.round(((enCours ? l.fin : l.debut).getTime() - maintenant.getTime()) / 60_000);
  return { ...l, enCours, minutes };
}

export const heure = (d: Date) => d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

export const duree = (minutes: number) =>
  minutes < 60 ? `${minutes} min` : `${Math.floor(minutes / 60)} h ${String(minutes % 60).padStart(2, '0')}`;
