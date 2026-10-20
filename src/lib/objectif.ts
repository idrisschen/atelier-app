import type { Objectif } from './types';

const JOUR = 86_400_000;

// Calcul déterministe : où j'en suis, et le rythme qu'il faut tenir pour arriver à l'échéance.
export function avancement(o: Objectif, maintenant = new Date()) {
  const releves = [...o.releves].sort((a, b) => a.date.localeCompare(b.date));
  const premier = releves[0];
  const dernier = releves[releves.length - 1];
  const actuel = dernier?.valeur ?? 0;
  const depart = premier?.valeur ?? 0;
  const restant = Math.max(0, o.cible - actuel);
  const joursRestants = Math.max(0, Math.ceil((new Date(o.echeance).getTime() - maintenant.getTime()) / JOUR));
  const parSemaine = joursRestants > 0 ? Math.ceil((restant / joursRestants) * 7) : restant;
  const pct = o.cible > depart ? Math.min(1, Math.max(0, (actuel - depart) / (o.cible - depart))) : actuel >= o.cible ? 1 : 0;

  // Rythme réel sur les 7 derniers jours de relevés.
  let rythme: number | null = null;
  if (dernier) {
    const ref = releves.filter((r) => new Date(dernier.date).getTime() - new Date(r.date).getTime() >= 6 * JOUR).pop();
    if (ref) {
      const jours = (new Date(dernier.date).getTime() - new Date(ref.date).getTime()) / JOUR;
      rythme = Math.round(((dernier.valeur - ref.valeur) / jours) * 7);
    }
  }

  return { releves, actuel, restant, joursRestants, parSemaine, pct, rythme, atteint: actuel >= o.cible };
}

export const nombre = (n: number) => n.toLocaleString('fr-FR');
