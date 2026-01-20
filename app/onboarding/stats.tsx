import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  StatusBar,
  ScrollView,
} from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Sparkles, Camera, Sliders, X, Check } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import StatsRadarComponent from '@/components/StatsRadar';
import { StatsRadar, PositionEnum, FootEnum } from '@/types';
import { useAppStore } from '@/store/useAppStore';
import { calculateAgeCategory } from '@/services/mockApi';
import PlayerCard from '@/components/PlayerCard';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

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
  const insets = useSafeAreaInsets();
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
  const [isPhotoMode, setIsPhotoMode] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const avgRating = Number((Object.values(stats).reduce((a, b) => a + b, 0) / 6).toFixed(1));
  const sheetY = useSharedValue(SCREEN_HEIGHT);

  useEffect(() => {
    // Initial scan animation
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

  const toggleSheet = (open: boolean) => {
    setIsSheetOpen(open);
    if (open) {
      sheetY.value = withSpring(0, { damping: 20, stiffness: 90 });
    } else {
      sheetY.value = withSpring(SCREEN_HEIGHT, { damping: 20, stiffness: 90 });
    }
  };

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: sheetY.value }]
  }));

  const handleStatChange = (stat: keyof StatsRadar, value: number) => {
    setStats((prev) => ({ ...prev, [stat]: Math.round(value) }));
  };

  const handleComplete = async () => {
    setIsLoading(true);
    const birthDateObj = params.birthDate ? new Date(params.birthDate) : null;
    try {
      await completeOnboarding({
        nickname: params.nickname || '',
        avatar_url: (typeof params.avatar === 'string' && !isNaN(Number(params.avatar)))
          ? Number(params.avatar)
          : (params.avatar || ''),
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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Dark Background with Gradient */}
      <LinearGradient
        colors={['#0a0a0f', '#1a1a24', '#0d0d12']}
        style={styles.bgGradient}
      />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header - Hidden in Photo Mode */}
          <AnimatePresence>
            {!isPhotoMode && (
              <MotiView
                from={{ opacity: 0, translateY: -20 }}
                animate={{ opacity: 1, translateY: 0 }}
                exit={{ opacity: 0, translateY: -20 }}
                style={styles.header}
              >
                <View>
                  <Text style={styles.title}>¡Carta de Leyenda!</Text>
                  <Text style={styles.subtitle}>Tu carta especial está lista.</Text>
                </View>
                <TouchableOpacity
                  style={styles.photoIconButton}
                  onPress={() => setIsPhotoMode(true)}
                >
                  <Camera size={22} color={Colors.dark.primary} />
                </TouchableOpacity>
              </MotiView>
            )}
          </AnimatePresence>

          {/* Card Section */}
          <View style={styles.cardSection}>
            <PlayerCard
              nickname={params.nickname || ''}
              avatar={params.avatar}
              stats={stats}
              mainPosition={params.mainPosition || ''}
              specificRole={params.specificRole}
              overall={avgRating}
            />

            {!isPhotoMode && (
              <TouchableOpacity
                style={styles.editIconButton}
                onPress={() => toggleSheet(true)}
                activeOpacity={0.7}
              >
                <Sliders size={22} color="rgba(255,255,255,0.9)" />
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>

        {/* Bottom Actions - Hidden in Photo Mode */}
        <AnimatePresence>
          {!isPhotoMode && (
            <MotiView
              from={{ opacity: 0, translateY: 50 }}
              animate={{ opacity: 1, translateY: 0 }}
              exit={{ opacity: 0, translateY: 50 }}
              style={styles.footer}
            >
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => router.back()}
                  disabled={isLoading}
                >
                  <ChevronLeft size={24} color={Colors.dark.text} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.completeButton, isLoading && styles.buttonDisabled]}
                  onPress={handleComplete}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  {isLoading ? (
                    <ActivityIndicator color={Colors.dark.background} />
                  ) : (
                    <>
                      <Text style={styles.completeButtonText}>¡CONFIRMAR FICHAJE!</Text>
                      <Sparkles size={20} color={Colors.dark.background} />
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </MotiView>
          )}
        </AnimatePresence>

        {/* Photo Mode Overlay UI */}
        <AnimatePresence>
          {isPhotoMode && (
            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={styles.photoModeOverlay}
            >
              <TouchableOpacity
                style={styles.closePhotoBtn}
                onPress={() => setIsPhotoMode(false)}
              >
                <X size={28} color="#fff" />
              </TouchableOpacity>

              <Text style={styles.photoModeHint}>Tomá una captura de pantalla</Text>

              <View style={styles.photoModeFooter}>
                <Text style={styles.appName}>FALTA UNO</Text>
              </View>
            </MotiView>
          )}
        </AnimatePresence>
      </SafeAreaView>

      {/* Backdrop for Bottom Sheet */}
      {isSheetOpen && (
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={() => toggleSheet(false)}
        />
      )}

      {/* Collapsible Bottom Sheet for Stats */}
      <Animated.View style={[styles.bottomSheet, sheetStyle]}>
        <View style={styles.sheetHeader}>
          <View style={styles.handle} />
          <View style={styles.sheetTitleRow}>
            <Text style={styles.sheetTitle}>Ajustá tus Atributos</Text>
            <TouchableOpacity onPress={() => toggleSheet(false)}>
              <Check size={24} color={Colors.dark.primary} />
            </TouchableOpacity>
          </View>
        </View>
        <ScrollView style={styles.sheetContent} showsVerticalScrollIndicator={false}>
          <StatsRadarComponent
            stats={stats}
            onStatChange={handleStatChange}
          />
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  bgGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 120, // Space for footer buttons
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.dark.textSecondary,
    marginTop: 2,
  },
  photoIconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  cardSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  editIconButton: {
    position: 'absolute',
    bottom: 15,
    right: 15,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.25)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  footer: {
    padding: 24,
    paddingTop: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  backButton: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  completeButton: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    backgroundColor: Colors.dark.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  completeButtonText: {
    color: Colors.dark.background,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  photoModeOverlay: {
    ...StyleSheet.absoluteFillObject,
    padding: 40,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  closePhotoBtn: {
    alignSelf: 'flex-start',
    width: 44,
    height: 44,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoModeHint: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  photoModeFooter: {
    width: '100%',
    alignItems: 'center',
  },
  appName: {
    color: Colors.dark.primary,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 8,
    opacity: 0.8,
  },
  bottomSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: SCREEN_HEIGHT * 0.7,
    backgroundColor: '#121218',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -20 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 30,
    zIndex: 999,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    zIndex: 998,
  },
  sheetHeader: {
    marginBottom: 20,
    alignItems: 'center',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    marginBottom: 20,
  },
  sheetTitleRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sheetTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  sheetContent: {
    flex: 1,
  }
});
