import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Card, GradientButton, Heading, Screen } from '../components/ui';
import { useTheme } from '../lib/theme';
import type { AppScreenProps } from '../navigation/types';

const questions = [
  ['Employment', ['Student', 'Employed', 'Self-employed', 'Retired']],
  ['Income', ['Under $30k', '$30k-$60k', '$60k-$80k', '$80k+']],
] as const;

export default function CreditCardScreen({ navigation }: AppScreenProps<'CreditCard'>) {
  const { colors } = useTheme();
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<Record<number, string>>({});

  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={{ color: colors.accent, fontWeight: '700' }}>← Back</Text>
        </Pressable>
        <Heading size="md">Credit Card Assistant</Heading>
        <View style={{ width: 42 }} />
      </View>
      <Card>
        <Text style={{ color: colors.textMuted, fontSize: 12 }}>Step {step + 1} of {questions.length}</Text>
        <Heading size="md">{questions[step][0]}</Heading>
        {questions[step][1].map((option) => (
          <Pressable
            key={option}
            onPress={() => setSelected((prev) => ({ ...prev, [step]: option }))}
            style={{ marginTop: 10, borderWidth: 1, borderColor: selected[step] === option ? colors.accent : colors.border, borderRadius: 12, padding: 14 }}
          >
            <Text style={{ color: selected[step] === option ? colors.accent : colors.text, fontWeight: '600' }}>{option}</Text>
          </Pressable>
        ))}
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
          {step > 0 && <View style={{ flex: 1 }}><GradientButton title="Previous" onPress={() => setStep((value) => value - 1)} /></View>}
          <View style={{ flex: 1 }}>
            <GradientButton
              title={step === questions.length - 1 ? 'Finish' : 'Next'}
              onPress={() => step === questions.length - 1 ? navigation.goBack() : setStep((value) => value + 1)}
            />
          </View>
        </View>
      </Card>
    </Screen>
  );
}
