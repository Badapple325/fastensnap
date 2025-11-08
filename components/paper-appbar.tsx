import React from 'react';
import { Appbar } from 'react-native-paper';

type Props = {
  title?: string;
  subtitle?: string;
  onBack?: () => void;
};

export default function PaperAppbar({ title, subtitle, onBack }: Props) {
  return (
    <Appbar.Header>
      {onBack ? <Appbar.BackAction onPress={onBack} /> : null}
      <Appbar.Content title={title} subtitle={subtitle} />
    </Appbar.Header>
  );
}
