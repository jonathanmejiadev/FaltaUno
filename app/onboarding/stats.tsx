import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Sparkles } from 'lucide-react-native';
import Colors from '@/constants/colors';
import StatsRadarComponent from '@/components/StatsRadar';
import { StatsRadar, PositionEnum, FootEnum } from '@/types';
import { useAppStore } from '@/store/useAppStore';

const DEFAULT_STATS: StatsRadar = {
  pace: 5,
  shooting: 5,
  passing: 5,
  defense: 5,
  physical: 5,
  stamina: 5,
};

export default function OnboardingStats() {
  const router = useRouter();
  const { completeOnboarding } = useAppStore();
  const params = useLocalSearchParams<{
    nickname: string;
    avatar: string;
    birthDate: string;
    mainPosition: string;
    specificRole: string;
    isVersatile: string;
    dominantFoot: string;
  }>();

  const [stats, setStats] = useState<StatsRadar>(DEFAULT_STATS);
  const [isLoading, setIsLoading] = useState(false);

  const handleStatChange = (stat: keyof StatsRadar, value: number) => {
    setStats((prev) => ({ ...prev, [stat]: Math.round(value) }));
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      await completeOnboarding({
        nickname: params.nickname || '',
        avatar_url: params.avatar || '',
        birth_date: params.birthDate ? new Date(params.birthDate) : null,
        main_position: (params.mainPosition as PositionEnum) || PositionEnum.MID,
        specific_role: params.specificRole || '',
        is_versatile: params.isVersatile === 'true',
        dominant_foot: (params.dominantFoot as FootEnum) || FootEnum.RIGHT,
        stats_radar: stats,
      });
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const avgRating = Math.round(Object.values(stats).reduce((a, b) => a + b, 0) / 6);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Tus Stats</Text>
          <Text style={styles.subtitle}>
            Define tus habilidades en la cancha
          </Text>
        </View>

        <View style={styles.stepIndicator}>
          <View style={[styles.step, styles.stepCompleted]} />
          <View style={[styles.step, styles.stepCompleted]} />
          <View style={[styles.step, styles.stepActive]} />
        </View>

        <View style={styles.ratingPreview}>
          <View style={styles.ratingCircle}>
            <Text style={styles.ratingNumber}>{avgRating}</Text>
            <Text style={styles.ratingLabel}>Media</Text>
          </View>
          <View style={styles.ratingInfo}>
            <Text style={styles.ratingTitle}>
              {avgRating >= 8 ? '¡Crack!' : avgRating >= 6 ? 'Buen Nivel' : avgRating >= 4 ? 'En Forma' : 'Amateur'}
            </Text>
            <Text style={styles.ratingHint}>
              Ajusta tus stats para reflejar tu nivel real
            </Text>
          </View>
        </View>

        <StatsRadarComponent
          stats={stats}
          onStatChange={handleStatChange}
        />
      </ScrollView>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.8}
          disabled={isLoading}
        >
          <ChevronLeft size={24} color={Colors.dark.text} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.completeButton, isLoading && styles.buttonDisabled]}
          onPress={handleComplete}
          activeOpacity={0.8}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={Colors.dark.background} />
          ) : (
            <>
              <Sparkles size={20} color={Colors.dark.background} />
              <Text style={styles.completeButtonText}>¡Crear Jugador!</Text>
            </>
          )}
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
  ratingPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    gap: 16,
  },
  ratingCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.dark.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.dark.background,
  },
  ratingLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.dark.background,
    opacity: 0.7,
  },
  ratingInfo: {
    flex: 1,
  },
  ratingTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.dark.text,
    marginBottom: 4,
  },
  ratingHint: {
    fontSize: 13,
    color: Colors.dark.textSecondary,
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
  completeButton: {
    flex: 1,
    backgroundColor: Colors.dark.primary,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  completeButtonText: {
    color: Colors.dark.background,
    fontSize: 18,
    fontWeight: '700',
  },
});
