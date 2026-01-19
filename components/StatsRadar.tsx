import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import Colors from '@/constants/colors';
import { StatsRadar as StatsRadarType } from '@/types';

interface StatsRadarProps {
  stats: StatsRadarType;
  onStatChange: (stat: keyof StatsRadarType, value: number) => void;
  readonly?: boolean;
}

const STAT_CONFIG = [
  { key: 'pace' as const, label: 'Ritmo', emoji: '⚡', messages: ['Lento...', 'Trota bien', 'Rápido!', '¡Velocista!'] },
  { key: 'shooting' as const, label: 'Tiro', emoji: '🎯', messages: ['Errado...', 'Conecta', 'Certero', '¡Goleador!'] },
  { key: 'passing' as const, label: 'Pase', emoji: '🎪', messages: ['Impreciso', 'Correcto', 'Fino', '¡Maestro!'] },
  { key: 'defense' as const, label: 'Defensa', emoji: '🛡️', messages: ['Flojo', 'Aguanta', 'Firme', '¡Muro!'] },
  { key: 'physical' as const, label: 'Físico', emoji: '💪', messages: ['Liviano', 'Normal', 'Fuerte', '¡Tanque!'] },
  { key: 'stamina' as const, label: 'Aguante', emoji: '🫁', messages: ['Poco', 'Regular', 'Bueno', '¡Infinito!'] },
];

function getMessage(value: number, messages: string[]): string {
  if (value <= 2) return messages[0];
  if (value <= 5) return messages[1];
  if (value <= 8) return messages[2];
  return messages[3];
}

export default function StatsRadarComponent({ stats, onStatChange, readonly = false }: StatsRadarProps) {
  const totalPoints = Object.values(stats).reduce((a, b) => a + b, 0);
  const avgRating = Math.round(totalPoints / 6);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Atributos del Jugador</Text>
        <View style={styles.ratingBadge}>
          <Text style={styles.ratingText}>{avgRating}</Text>
        </View>
      </View>

      {STAT_CONFIG.map((config) => {
        const value = stats[config.key];
        const message = getMessage(value, config.messages);
        
        return (
          <View key={config.key} style={styles.statRow}>
            <View style={styles.statHeader}>
              <Text style={styles.statEmoji}>{config.emoji}</Text>
              <Text style={styles.statLabel}>{config.label}</Text>
              <View style={styles.statValueContainer}>
                <Text style={styles.statValue}>{value}</Text>
              </View>
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
    backgroundColor: Colors.dark.surface,
    borderRadius: 16,
    padding: 20,
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
  statEmoji: {
    fontSize: 18,
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
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statValue: {
    color: Colors.dark.primary,
    fontSize: 16,
    fontWeight: '700',
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
});
