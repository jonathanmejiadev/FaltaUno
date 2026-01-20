import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { MotiView } from 'moti';
import { AGE_CATEGORY_LABELS } from '@/types';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Sparkles } from 'lucide-react-native';
import Colors from '@/constants/colors';
import StatsRadarComponent from '@/components/StatsRadar';
import { StatsRadar, PositionEnum, FootEnum, AgeCategoryEnum } from '@/types';
import { useAppStore } from '@/store/useAppStore';
import { calculateAgeCategory } from '@/services/mockApi';
import PlayerCard from '@/components/PlayerCard';

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
  const avgRating = Number((Object.values(stats).reduce((a, b) => a + b, 0) / 6).toFixed(1));



  useEffect(() => {
    // Escaneo inicial: animar de 0 a DEFAULT_STATS
    let step = 0;
    const steps = 30;
    const interval = setInterval(() => {
      step++;
      const progress = step / steps;
      setStats({
        pace: Math.round(DEFAULT_STATS.pace * progress),
        shooting: Math.round(DEFAULT_STATS.shooting * progress),
        passing: Math.round(DEFAULT_STATS.passing * progress),
        defense: Math.round(DEFAULT_STATS.defense * progress),
        physical: Math.round(DEFAULT_STATS.physical * progress),
        stamina: Math.round(DEFAULT_STATS.stamina * progress),
      });
      if (step >= steps) clearInterval(interval);
    }, 20);
    return () => clearInterval(interval);
  }, []);

  const handleStatChange = (stat: keyof StatsRadar, value: number) => {
    setStats((prev) => ({ ...prev, [stat]: Math.round(value) }));
  };

  const handleComplete = async () => {
    setIsLoading(true);
    const birthDateObj = params.birthDate ? new Date(params.birthDate) : null;
    try {
      await completeOnboarding({
        nickname: params.nickname || '',
        avatar_url: params.avatar || '',
        birth_date: birthDateObj,
        age_category: calculateAgeCategory(birthDateObj),
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>¡Fichaje Estrella!</Text>
          <Text style={styles.subtitle}>
            Tus stats finales para salir a romperla.
          </Text>
        </View>

        <View style={styles.stepIndicator}>
          <View style={[styles.step, styles.stepCompleted]} />
          <View style={[styles.step, styles.stepCompleted]} />
          <View style={[styles.step, styles.stepActive]} />
        </View>

        <PlayerCard
          nickname={params.nickname || ''}
          avatar={params.avatar}
          stats={stats}
          mainPosition={params.mainPosition || ''}
          specificRole={params.specificRole}
          overall={avgRating}
        />

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

        <MotiView
          from={{ scale: 1 }}
          animate={{ scale: 1.02 }}
          transition={{
            type: 'timing',
            duration: 1000,
            loop: true,
            repeatReverse: true,
          }}
          style={{ flex: 1 }}
        >
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
                <Text style={styles.completeButtonText}>¡A la cancha!</Text>
                <Sparkles size={20} color={Colors.dark.background} />
              </>
            )}
          </TouchableOpacity>
        </MotiView>
      </View>
    </SafeAreaView >
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
    // Neon glow
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
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
