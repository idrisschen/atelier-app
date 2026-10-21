// Créer : toutes les cartes d'embarquement, de l'idée au verdict.
import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { BoardingPass } from '@/components/boarding-pass';
import { Icon, type NomIcone } from '@/components/icon';
import { Card, Chip, IconButton, Screen, Txt } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useStore } from '@/lib/store';
import type { Statut } from '@/lib/types';

const FILTRES: { label: string; icon: NomIcone; statuts: Statut[] }[] = [
  { label: 'En cours', icon: 'tournage', statuts: ['idee', 'brief', 'tournage'] },
  { label: 'Publiés', icon: 'publie', statuts: ['publie', 'verdict'] },
];

export default function Creer() {
  const { state } = useStore();
  const [filtre, setFiltre] = useState(0);
  const liste = state.contenus.filter((c) => FILTRES[filtre].statuts.includes(c.statut));

  return (
    <Screen title="Créer" right={<IconButton icon="ajouter" label="Nouvelle idée" color="accent" onPress={() => router.push('/contenu/nouveau')} />}>
      <View style={{ flexDirection: 'row', gap: Spacing.two }}>
        {FILTRES.map((f, i) => (
          <Chip key={f.label} icon={f.icon} label={`${f.label} · ${state.contenus.filter((c) => f.statuts.includes(c.statut)).length}`} selected={filtre === i} onPress={() => setFiltre(i)} />
        ))}
      </View>
      {liste.length === 0 ? (
        <Card onPress={filtre === 0 ? () => router.push('/contenu/nouveau') : undefined} label="Nouvelle idée">
          <Icon name={filtre === 0 ? 'idee' : 'publie'} size="xl" color={filtre === 0 ? 'warning' : 'success'} />
          <Txt variant="heading">{filtre === 0 ? 'Rien en préparation' : 'Rien de publié pour l’instant'}</Txt>
          <Txt variant="small" color="textSecondary">
            {filtre === 0
              ? 'Chaque idée devient une carte : brief, tournage, publication, puis le verdict à 48 h.'
              : 'Quand tu publies un contenu, il arrive ici et attend son verdict.'}
          </Txt>
        </Card>
      ) : (
        liste.map((c) => <BoardingPass key={c.id} c={c} onPress={() => router.push(`/contenu/${c.id}`)} />)
      )}
    </Screen>
  );
}
