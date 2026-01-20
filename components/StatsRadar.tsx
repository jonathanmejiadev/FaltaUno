import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import { StatsRadar as StatsRadarType } from '@/types';

interface StatsRadarProps {
  stats: StatsRadarType;
  onStatChange: (stat: keyof StatsRadarType, value: number) => void;
  readonly?: boolean;
}

const STAT_CONFIG = [
  { key: 'pace' as const, label: 'Ritmo', icon: 'run-fast' as const, messages: ['Lento...', 'Trota bien', 'Rápido!', '¡Velocista!'] },
  { key: 'shooting' as const, label: 'Tiro', icon: 'target-variant' as const, messages: ['Errado...', 'Conecta', 'Certero', '¡Goleador!'] },
  { key: 'passing' as const, label: 'Pase', icon: 'shoe-cleat' as const, messages: ['Impreciso', 'Correcto', 'Fino', '¡Maestro!'] },
  { key: 'defense' as const, label: 'Defensa', icon: 'shield-check' as const, messages: ['Flojo', 'Aguanta', 'Firme', '¡Muro!'] },
  { key: 'physical' as const, label: 'Físico', icon: 'arm-flex' as const, messages: ['Liviano', 'Normal', 'Fuerte', '¡Tanque!'] },
  { key: 'stamina' as const, label: 'Aguante', icon: 'lightning-bolt' as const, messages: ['Poco', 'Regular', 'Bueno', '¡Infinito!'] },
];

function getMessage(value: number, messages: string[]): string {
  if (value <= 2) return messages[0];
  if (value <= 5) return messages[1];
  if (value <= 8) return messages[2];
  return messages[3];
}

function getFeedback(value: number): { text: string; color: string } {
  if (value >= 9) return { text: 'ELITE', color: Colors.dark.primary };
  if (value >= 7) return { text: 'PRO', color: Colors.dark.accent };
  if (value >= 5) return { text: 'AMATEUR', color: Colors.dark.info };
  return { text: 'BASE', color: Colors.dark.textSecondary };
}

export default function StatsRadarComponent({ stats, onStatChange, readonly = false }: StatsRadarProps) {
  const totalPoints = Object.values(stats).reduce((a, b) => a + b, 0);
  const avgRating = Math.round(totalPoints / 6);

  return (
    <View style={styles.container}>
      {/* Eliminamos el header interno para usar el de la pantalla de Onboarding */}

      {STAT_CONFIG.map((config) => {
        const value = stats[config.key];
        const message = getMessage(value, config.messages);

        return (
          <View key={config.key} style={styles.statRow}>
            <View style={styles.statHeader}>
              <MaterialCommunityIcons
                name={config.icon}
                size={22}
                color={Colors.dark.textSecondary}
                style={styles.statIcon}
              />
              <Text style={styles.statLabel}>{config.label}</Text>
              <View style={styles.statValueContainer}>
                <Text style={styles.statValue}>{value}</Text>
              </View>
              <Text style={[styles.feedbackLabel, { color: getFeedback(value).color }]}>
                {getFeedback(value).text}
              </Text>
            </View>

            {!readonly ? (
              <View style={styles.sliderContainer}>
                <Slider
                  style={styles.slider}
                  minimumValue={1}
                  maximumValue={10}
                  step={1}
                  value={value}
                  onValueChange={(val: number) => onStatChange(config.key, val)}
                  minimumTrackTintColor={Colors.dark.primary}
                  maximumTrackTintColor={Colors.dark.border}
                  thumbTintColor={Colors.dark.primary}
                />
                <Text style={styles.statMessage}>{message}</Text>
              </View>
            ) : (
              <View style={styles.barContainer}>
                <View style={[styles.bar, { width: `${value * 10}%` }]} />
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    paddingVertical: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    color: Colors.dark.text,
    fontSize: 18,
    fontWeight: '700',
  },
  ratingBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.dark.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingText: {
    color: Colors.dark.background,
    fontSize: 18,
    fontWeight: '800',
  },
  statRow: {
    marginBottom: 16,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statIcon: {
    marginRight: 8,
  },
  statLabel: {
    color: Colors.dark.text,
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  statValueContainer: {
    backgroundColor: Colors.dark.surfaceLight,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.dark.primary + '40',
    // Efecto de brillo
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 3,
  },
  statValue: {
    color: Colors.dark.primary,
    fontSize: 16,
    fontWeight: '800',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  slider: {
    flex: 1,
    height: 40,
  },
  statMessage: {
    color: Colors.dark.textSecondary,
    fontSize: 12,
    width: 80,
    textAlign: 'right',
  },
  barContainer: {
    height: 8,
    backgroundColor: Colors.dark.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    backgroundColor: Colors.dark.primary,
    borderRadius: 4,
  },
  feedbackLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 8,
    textTransform: 'uppercase',
  },
});
