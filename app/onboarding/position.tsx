import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight, ChevronLeft, Shuffle } from 'lucide-react-native';
import Colors from '@/constants/colors';
import PitchSelector from '@/components/PitchSelector';
import { PositionEnum, FootEnum, FOOT_LABELS } from '@/types';

const SPECIFIC_ROLES: Record<PositionEnum, string[]> = {
  [PositionEnum.GK]: ['Arquero'],
  [PositionEnum.DEF]: ['Central', 'Lateral Derecho', 'Lateral Izquierdo', 'Líbero'],
  [PositionEnum.MID]: ['Volante Central', 'Volante Mixto', 'Enganche', 'Mediapunta', 'Interior'],
  [PositionEnum.FWD]: ['Centro Delantero', 'Extremo', 'Segundo Punta', 'Falso 9'],
  [PositionEnum.ANY]: ['Comodín'],
};

export default function OnboardingPosition() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    nickname: string;
    avatar: string;
    birthDate: string;
  }>();

  const [mainPosition, setMainPosition] = useState<PositionEnum>(PositionEnum.MID);
  const [specificRole, setSpecificRole] = useState(SPECIFIC_ROLES[PositionEnum.MID][0]);
  const [isVersatile, setIsVersatile] = useState(false);
  const [dominantFoot, setDominantFoot] = useState<FootEnum>(FootEnum.RIGHT);

  const handlePositionChange = (position: PositionEnum) => {
    setMainPosition(position);
    setSpecificRole(SPECIFIC_ROLES[position][0]);
  };

  const handleNext = () => {
    router.push({
      pathname: '/onboarding/stats',
      params: {
        ...params,
        mainPosition,
        specificRole,
        isVersatile: isVersatile.toString(),
        dominantFoot,
      },
    });
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Tu Posición</Text>
          <Text style={styles.subtitle}>
            ¿Dónde brillas en la cancha?
          </Text>
        </View>

        <View style={styles.stepIndicator}>
          <View style={[styles.step, styles.stepCompleted]} />
          <View style={[styles.step, styles.stepActive]} />
          <View style={styles.step} />
        </View>

        <View style={styles.pitchContainer}>
          <PitchSelector
            selectedPosition={mainPosition}
            onSelectPosition={handlePositionChange}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rol Específico</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.rolesContainer}
          >
            {SPECIFIC_ROLES[mainPosition].map((role) => (
              <TouchableOpacity
                key={role}
                style={[
                  styles.roleChip,
                  specificRole === role && styles.roleChipActive,
                ]}
                onPress={() => setSpecificRole(role)}
              >
                <Text
                  style={[
                    styles.roleChipText,
                    specificRole === role && styles.roleChipTextActive,
                  ]}
                >
                  {role}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.versatileRow}>
            <View style={styles.versatileInfo}>
              <Shuffle size={20} color={Colors.dark.accent} />
              <View>
                <Text style={styles.versatileTitle}>Soy Versátil</Text>
                <Text style={styles.versatileHint}>Juego de lo que sea</Text>
              </View>
            </View>
            <Switch
              value={isVersatile}
              onValueChange={setIsVersatile}
              trackColor={{ false: Colors.dark.border, true: Colors.dark.accentGlow }}
              thumbColor={isVersatile ? Colors.dark.accent : Colors.dark.textMuted}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pie Hábil</Text>
          <View style={styles.footContainer}>
            {Object.values(FootEnum).map((foot) => (
              <TouchableOpacity
                key={foot}
                style={[
                  styles.footButton,
                  dominantFoot === foot && styles.footButtonActive,
                ]}
                onPress={() => setDominantFoot(foot)}
              >
                <Text
                  style={[
                    styles.footButtonText,
                    dominantFoot === foot && styles.footButtonTextActive,
                  ]}
                >
                  {FOOT_LABELS[foot]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.8}
        >
          <ChevronLeft size={24} color={Colors.dark.text} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Text style={styles.nextButtonText}>Siguiente</Text>
          <ChevronRight size={24} color={Colors.dark.background} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.dark.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.dark.textSecondary,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  step: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.dark.border,
  },
  stepActive: {
    backgroundColor: Colors.dark.primary,
  },
  stepCompleted: {
    backgroundColor: Colors.dark.primary,
    opacity: 0.5,
  },
  pitchContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 12,
  },
  rolesContainer: {
    gap: 8,
  },
  roleChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.dark.surface,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  roleChipActive: {
    backgroundColor: Colors.dark.primary,
    borderColor: Colors.dark.primary,
  },
  roleChipText: {
    color: Colors.dark.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  roleChipTextActive: {
    color: Colors.dark.background,
    fontWeight: '600',
  },
  versatileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.dark.surface,
    padding: 16,
    borderRadius: 12,
  },
  versatileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  versatileTitle: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: '600',
  },
  versatileHint: {
    color: Colors.dark.textMuted,
    fontSize: 12,
  },
  footContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  footButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.dark.surface,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    alignItems: 'center',
  },
  footButtonActive: {
    backgroundColor: Colors.dark.accent,
    borderColor: Colors.dark.accent,
  },
  footButtonText: {
    color: Colors.dark.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  footButtonTextActive: {
    color: Colors.dark.text,
  },
  buttonRow: {
    flexDirection: 'row',
    padding: 24,
    paddingTop: 0,
    gap: 12,
  },
  backButton: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: Colors.dark.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButton: {
    flex: 1,
    backgroundColor: Colors.dark.primary,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  nextButtonText: {
    color: Colors.dark.background,
    fontSize: 18,
    fontWeight: '700',
  },
});
