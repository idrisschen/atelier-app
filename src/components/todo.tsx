// La todo de l'accueil, reprise de celle d'Erwin : « Ma liste » (dans l'ordre des priorités) et « Cette semaine »
// (les publications à tenir, par type, qui se cochent toutes seules quand un contenu est publié).
import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Button, Card, Check, Chip, Divider, IconButton, Num, Section, Status, Txt, succes, tap } from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { FORMATS } from '@/lib/brief';
import { newId, today } from '@/lib/dates';
import { CASES_DEFAUT, casesDeLaSemaine } from '@/lib/reseaux';
import { useStore } from '@/lib/store';
import type { CaseSemaine, FormatContenu } from '@/lib/types';

export function MaListe() {
  const theme = useTheme();
  const { state, update } = useStore();
  const [texte, setTexte] = useState('');
  const aFaire = state.taches.filter((t) => !t.faite);
  const faites = state.taches.filter((t) => t.faite);

  const ajouter = () => {
    const t = texte.trim();
    if (!t) return;
    tap();
    update((s) => ({ ...s, taches: [...s.taches.filter((x) => !x.faite), { id: newId(), texte: t, faite: false, cree: today() }, ...s.taches.filter((x) => x.faite)] }));
    setTexte('');
  };
  const basculer = (id: string) => {
    const t = state.taches.find((x) => x.id === id)!;
    if (t.faite) tap();
    else succes();
    // Une tâche faite descend sous les autres ; rouverte, elle reprend la dernière priorité.
    update((s) => {
      const autres = s.taches.filter((x) => x.id !== id);
      const maj = { ...t, faite: !t.faite };
      return { ...s, taches: maj.faite ? [...autres, maj] : [...autres.filter((x) => !x.faite), maj, ...autres.filter((x) => x.faite)] };
    });
  };
  const monter = (id: string) =>
    update((s) => {
      const i = s.taches.findIndex((x) => x.id === id);
      if (i <= 0) return s;
      const t = [...s.taches];
      [t[i - 1], t[i]] = [t[i], t[i - 1]];
      return { ...s, taches: t };
    });
  const effacerFaites = () => update((s) => ({ ...s, taches: s.taches.filter((x) => !x.faite) }));

  return (
    <Section titre={`Ma liste${aFaire.length ? ` · ${aFaire.length}` : ''}`} icon="liste">
      <Card>
        {aFaire.map((t, i) => (
          <View key={t.id} style={styles.ligne}>
            <Num size={16} color={i === 0 ? 'accent' : 'textSecondary'} style={{ width: 18 }}>{i + 1}</Num>
            <View style={{ flex: 1 }}>
              <Check checked={false} label={t.texte} onPress={() => basculer(t.id)} />
            </View>
            {i > 0 ? <IconButton icon="monter" label={`Monter « ${t.texte} »`} taille={32} color="textSecondary" onPress={() => monter(t.id)} /> : null}
          </View>
        ))}
        <View style={styles.ajout}>
          <Icon name="ajouter" size="sm" color="accent" />
          <TextInput
            value={texte}
            onChangeText={setTexte}
            onSubmitEditing={ajouter}
            returnKeyType="done"
            blurOnSubmit={false}
            placeholder={aFaire.length ? 'Ajouter une tâche' : 'Ta priorité du jour : envoyer le devis, monter le vlog…'}
            placeholderTextColor={theme.textTertiary}
            keyboardAppearance="dark"
            selectionColor={theme.accent}
            accessibilityLabel="Ajouter une tâche"
            style={[styles.champ, { color: theme.text }]}
          />
          {texte.trim() ? <IconButton icon="ok" label="Ajouter" taille={32} color="accent" onPress={ajouter} /> : null}
        </View>
        {faites.length ? (
          <>
            <Divider />
            {faites.map((t) => (
              <Check key={t.id} checked label={t.texte} onPress={() => basculer(t.id)} />
            ))}
            <Button kind="ghost" icon="supprimer" label={`Effacer ${faites.length > 1 ? `les ${faites.length} faites` : 'la faite'}`} onPress={effacerFaites} />
          </>
        ) : null}
      </Card>
    </Section>
  );
}

export function CetteSemaine() {
  const { state, update } = useStore();
  const [edition, setEdition] = useState(false);
  const { lundi, cases } = casesDeLaSemaine(state, today());
  const faites = cases.filter((c) => c.cochee).length;

  const basculer = (i: number) => {
    if (cases[i].auto) return; // cochée par un contenu publié : on ne la décoche pas à la main
    const deja = state.casesCochees[lundi] ?? [];
    if (deja.includes(i)) tap();
    else succes();
    update((s) => {
      const d = s.casesCochees[lundi] ?? [];
      return { ...s, casesCochees: { ...s.casesCochees, [lundi]: d.includes(i) ? d.filter((x) => x !== i) : [...d, i] } };
    });
  };

  return (
    <Section
      titre={`Cette semaine · ${faites}/${cases.length}`}
      icon="date"
      action={<IconButton icon={edition ? 'ok' : 'editer'} label={edition ? 'Terminer' : 'Modifier les cases'} taille={36} onPress={() => setEdition(!edition)} />}>
      <Card>
        {edition ? (
          <EditionCases />
        ) : (
          cases.map((c, i) => (
            <View key={i} style={styles.ligne}>
              <View style={{ flex: 1 }}>
                <Check checked={c.cochee} label={c.label} onPress={() => basculer(i)} />
              </View>
              {c.auto ? <Status label="Publié" icon="publie" color="success" /> : c.format ? <Txt variant="label">{FORMATS[c.format].label}</Txt> : null}
            </View>
          ))
        )}
      </Card>
    </Section>
  );
}

function EditionCases() {
  const { state, update } = useStore();
  const theme = useTheme();
  const cases = state.reglages.cases ?? CASES_DEFAUT;
  const [label, setLabel] = useState('');
  const [format, setFormat] = useState<FormatContenu | undefined>(undefined);
  const enregistre = (cs: CaseSemaine[]) => update((s) => ({ ...s, reglages: { ...s.reglages, cases: cs } }));

  return (
    <View style={{ gap: Spacing.two }}>
      {cases.map((c, i) => (
        <View key={i} style={styles.ligne}>
          <Txt style={{ flex: 1 }}>{c.label}</Txt>
          {c.format ? <Txt variant="label">{FORMATS[c.format].label}</Txt> : null}
          <IconButton icon="supprimer" label={`Retirer « ${c.label} »`} taille={32} color="danger" onPress={() => enregistre(cases.filter((_, j) => j !== i))} />
        </View>
      ))}
      <Divider />
      <TextInput
        value={label}
        onChangeText={setLabel}
        placeholder="Nouvelle case : post perso, vlog, carrousel…"
        placeholderTextColor={theme.textTertiary}
        keyboardAppearance="dark"
        selectionColor={theme.accent}
        accessibilityLabel="Nouvelle case"
        style={[styles.champ, styles.cadre, { color: theme.text }]}
      />
      <Txt variant="label">Se coche toute seule quand tu publies</Txt>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two }}>
        <Chip label="N’importe quel contenu" selected={format === undefined} onPress={() => setFormat(undefined)} />
        {(Object.keys(FORMATS) as FormatContenu[]).map((f) => (
          <Chip key={f} label={FORMATS[f].label} selected={format === f} onPress={() => setFormat(f)} />
        ))}
      </View>
      <Button
        kind="secondary"
        icon="ajouter"
        label="Ajouter la case"
        disabled={!label.trim()}
        onPress={() => {
          enregistre([...cases, { label: label.trim(), format }]);
          setLabel('');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  ligne: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  ajout: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, minHeight: 44 },
  champ: { flex: 1, fontSize: 16, paddingVertical: 10 },
  cadre: { borderRadius: Radius.medium, paddingHorizontal: Spacing.three, backgroundColor: 'rgba(255,255,255,0.06)' },
});
