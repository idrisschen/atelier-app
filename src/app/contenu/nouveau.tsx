// Nouvelle idée : un sujet, un format, une plateforme. Le brief peut être préparé tout de suite.
import { router } from 'expo-router';
import { useState } from 'react';

import { Button, Chip, ErrorNote, Field, Groupe, Screen } from '@/components/ui';
import { askAtelier } from '@/lib/ai';
import { briefLocal, FORMATS } from '@/lib/brief';
import { ajouteJours, newId, today, useStore } from '@/lib/store';
import type { Brief, Contenu, FormatContenu } from '@/lib/types';

const QUAND = [
  { label: 'Aujourd’hui', jours: 0 },
  { label: 'Demain', jours: 1 },
  { label: 'Dans 3 jours', jours: 3 },
  { label: 'Pas encore', jours: null },
];

export default function Nouveau() {
  const { state, update } = useStore();
  const plateformes = state.profile?.plateformes ?? ['Instagram'];
  const [titre, setTitre] = useState('');
  const [format, setFormat] = useState<FormatContenu>('reportage');
  const [plateforme, setPlateforme] = useState(plateformes[0]);
  const [quand, setQuand] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const creer = async (avecBrief: boolean) => {
    if (!state.profile) return;
    setError(null);
    let brief: Brief | undefined;
    if (avecBrief) {
      if (state.reglages.ia) {
        setLoading(true);
        try {
          brief = (await askAtelier<Brief>('tournage', state.profile, { sujet: `${FORMATS[format].label} : ${titre}`, date: today() })).result;
        } catch (e) {
          setLoading(false);
          return setError((e as Error).message);
        }
        setLoading(false);
      } else {
        brief = briefLocal(format, state.profile);
      }
    }
    const c: Contenu = {
      id: newId(),
      titre: titre.trim(),
      format,
      plateforme,
      statut: brief ? 'brief' : 'idee',
      cree: today(),
      tournage: quand === null ? undefined : ajouteJours(today(), quand),
      brief,
      plansFaits: [],
    };
    update((s) => ({ ...s, contenus: [c, ...s.contenus] }));
    router.replace(`/contenu/${c.id}`);
  };

  return (
    <Screen title="Nouvelle idée" kicker="Créer">
      <Field label="Le sujet" value={titre} onChangeText={setTitre} placeholder="Le marché forain du dimanche" autoFocus multiline />
      <Groupe titre="Format">
        {(Object.keys(FORMATS) as FormatContenu[]).map((f) => (
          <Chip key={f} label={FORMATS[f].label} selected={format === f} onPress={() => setFormat(f)} />
        ))}
      </Groupe>
      <Groupe titre="Plateforme">
        {plateformes.map((p) => (
          <Chip key={p} label={p} selected={plateforme === p} onPress={() => setPlateforme(p)} />
        ))}
      </Groupe>
      <Groupe titre="Tournage">
        {QUAND.map((q) => (
          <Chip key={q.label} label={q.label} selected={quand === q.jours} onPress={() => setQuand(q.jours)} />
        ))}
      </Groupe>
      <Button label="Préparer le brief" onPress={() => creer(true)} loading={loading} disabled={titre.trim().length < 3} />
      <Button kind="secondary" label="Garder en idée" onPress={() => creer(false)} disabled={titre.trim().length < 3 || loading} />
      <Button kind="ghost" label="Annuler" onPress={() => router.back()} />
      <ErrorNote message={error} />
    </Screen>
  );
}
