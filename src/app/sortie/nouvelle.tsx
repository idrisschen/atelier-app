// Planifier une sortie : où, quand (avec les heures de belle lumière proposées), et le contenu qu'elle sert.
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { Button, Chip, ErrorNote, Field, Groupe, Screen } from '@/components/ui';
import { heure, lumieresDuJour } from '@/lib/soleil';
import { ajouteJours, newId, today, useStore } from '@/lib/store';
import type { Sortie } from '@/lib/types';

const JOURS = 7;
const HEURES_PAR_DEFAUT = ['08:00', '12:00', '17:00', '19:00'];

export default function NouvelleSortie() {
  const params = useLocalSearchParams<{ lieu?: string }>();
  const { state, update } = useStore();
  const [lieu, setLieu] = useState(params.lieu ?? '');
  const [jour, setJour] = useState(today());
  const [heureChoisie, setHeure] = useState('');
  const [note, setNote] = useState('');
  const [contenuId, setContenuId] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);

  const [y, m, d] = jour.split('-').map(Number);
  const lumieres = state.position ? lumieresDuJour(new Date(y, m - 1, d), state.position.lat, state.position.lon) : [];
  const suggestions = lumieres.length
    ? lumieres
        .filter((l) => l.type === 'golden')
        // Minute supérieure : le créneau commence à hh:mm et quelques secondes, l'heure proposée doit tomber dedans.
        .map((l) => ({ debut: new Date(Math.ceil(l.debut.getTime() / 60_000) * 60_000), nom: l.nom }))
        .map((l) => ({ label: `${heure(l.debut)} · ${l.nom.replace('Golden hour ', '')}`, valeur: heure(l.debut) }))
    : HEURES_PAR_DEFAUT.map((h) => ({ label: h, valeur: h }));
  const enCours = state.contenus.filter((c) => c.statut === 'idee' || c.statut === 'brief' || c.statut === 'tournage');

  const enregistrer = () => {
    const h = heureChoisie.trim().replace('h', ':').replace(/^(\d):/, '0$1:');
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(h)) return setError('Heure au format 18:30.');
    const s: Sortie = { id: newId(), lieu: lieu.trim(), quand: `${jour}T${h}`, note: note.trim(), contenuId, faite: false };
    update((x) => ({ ...x, sorties: [...x.sorties, s] }));
    router.back();
  };

  return (
    <Screen title="Nouvelle sortie" kicker="Sortir">
      <Field label="Où" value={lieu} onChangeText={setLieu} placeholder="Marché du Chaudron" />
      <Groupe titre="Quand">
        {Array.from({ length: JOURS }, (_, i) => {
          const j = ajouteJours(today(), i);
          const [a, b, c] = j.split('-').map(Number);
          const label = i === 0 ? 'Aujourd’hui' : i === 1 ? 'Demain' : new Date(a, b - 1, c).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });
          return <Chip key={j} label={label} selected={jour === j} onPress={() => setJour(j)} />;
        })}
      </Groupe>
      <Groupe titre={lumieres.length ? 'Heure · golden hour proposée' : 'Heure'}>
        {suggestions.map((s) => (
          <Chip key={s.label} label={s.label} selected={heureChoisie === s.valeur} onPress={() => setHeure(s.valeur)} />
        ))}
      </Groupe>
      <Field label="Ou une autre heure" value={heureChoisie} onChangeText={setHeure} placeholder="18:30" keyboardType="numbers-and-punctuation" />
      <Field label="Note (facultatif)" value={note} onChangeText={setNote} placeholder="Demander au boulanger s’il accepte d’être filmé" />
      {enCours.length ? (
        <Groupe titre="Pour quel contenu (facultatif)">
          {enCours.map((c) => (
            <Chip key={c.id} label={c.titre.length > 28 ? `${c.titre.slice(0, 27)}…` : c.titre} selected={contenuId === c.id} onPress={() => setContenuId(contenuId === c.id ? undefined : c.id)} />
          ))}
        </Groupe>
      ) : null}
      <Button label="Planifier" onPress={enregistrer} disabled={lieu.trim().length < 2 || !heureChoisie} />
      <Button kind="ghost" label="Annuler" onPress={() => router.back()} />
      <ErrorNote message={error} />
    </Screen>
  );
}
