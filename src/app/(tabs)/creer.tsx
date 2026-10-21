// Le + (l'« Add Flight » de Flighty) : tout ce qu'on peut lancer, puis des suggestions tirées de ce qui est en cours.
import { router, type Href } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Icon, type NomIcone } from '@/components/icon';
import { Screen, Txt, tap } from '@/components/ui';
import { Spacing, type ThemeColor } from '@/constants/theme';
import { today } from '@/lib/dates';
import { ETAPES, IDEES_SORTIE } from '@/lib/options';
import { useStore } from '@/lib/store';

type Entree = { icon: NomIcone; couleur?: ThemeColor; titre: string; detail?: string; href: Href };

export default function Creer() {
  const { state } = useStore();
  const jour = today();
  const enCours = state.contenus.filter((c) => c.statut === 'idee' || c.statut === 'brief' || c.statut === 'tournage');
  const publies = state.contenus.length - enCours.length;
  const stories = state.missions[jour];

  const suggestions: Entree[] = [
    ...(stories && stories.faites.length < stories.missions.length
      ? [{ icon: 'questions', couleur: 'accent', titre: 'Stories du jour', detail: `${stories.faites.length}/${stories.missions.length} postées`, href: '/' } as Entree]
      : []),
    ...enCours.slice(0, 2).map(
      (c): Entree => ({ icon: c.statut, couleur: ETAPES.find((e) => e.id === c.statut)!.theme, titre: c.titre, detail: `Reprendre · ${ETAPES.find((e) => e.id === c.statut)!.label}`, href: `/contenu/${c.id}` }),
    ),
    ...IDEES_SORTIE.slice(0, 2).map(
      (i): Entree => ({ icon: 'lieu', couleur: 'golden', titre: i.titre, detail: 'Idée de sortie', href: { pathname: '/sortie/nouvelle', params: { lieu: i.titre } } }),
    ),
  ];

  return (
    <Screen title="Créer">
      <Txt color="textSecondary" style={{ marginTop: -Spacing.three, fontSize: 18 }}>Une idée, une sortie, une story.</Txt>

      <View>
        <Ligne icon="idee" couleur="warning" titre="Nouvelle idée" detail="Brief, tournage, puis le verdict." href="/contenu/nouveau" />
        <Ligne icon="lieu" couleur="golden" titre="Planifier une sortie" detail="Le lieu, l’heure, la lumière." href="/sortie/nouvelle" />
      </View>

      <Rubrique titre="Suggéré" />
      <View>
        {suggestions.map((s) => (
          <Ligne key={s.titre} {...s} />
        ))}
      </View>

      <Rubrique titre="Plus" />
      <View>
        <Ligne icon="creer" titre="Mes contenus" detail={`${enCours.length} en cours · ${publies} publié${publies > 1 ? 's' : ''}`} href="/contenus" />
        <Ligne icon="objectif" titre="Mon objectif" detail={state.objectif ? `${state.objectif.cible.toLocaleString('fr-FR')} sur ${state.objectif.plateforme}` : 'Pas encore fixé'} href="/objectif" />
      </View>
    </Screen>
  );
}

function Rubrique({ titre }: { titre: string }) {
  return (
    <Txt variant="label" style={styles.rubrique}>
      {titre}
    </Txt>
  );
}

function Ligne({ icon, couleur = 'text', titre, detail, href }: Entree) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={detail ? `${titre}, ${detail}` : titre}
      onPress={() => {
        tap();
        router.push(href);
      }}
      style={({ pressed }) => [styles.ligne, pressed && { opacity: 0.6 }]}>
      <View style={styles.icone}>
        <Icon name={icon} size="xl" color={couleur} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Txt style={{ fontSize: 19, fontWeight: '500' }} numberOfLines={1}>{titre}</Txt>
        {detail ? <Txt color="textSecondary" numberOfLines={1}>{detail}</Txt> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  rubrique: { marginTop: Spacing.three, fontSize: 14, letterSpacing: 1, textTransform: 'uppercase' },
  ligne: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, minHeight: 64, paddingVertical: Spacing.two },
  icone: { width: 40, alignItems: 'center' },
});
