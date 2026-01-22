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
  { key: 'stamina' as const, label: 'Resistencia', icon: 'lightning-bolt' as const, messages: ['Poco', 'Regular', 'Bueno', '¡Infinito!'] },
];

function getMessage(value: number, messages: string[]): string {
  if (value <= 2) return messages[0];
  if (value <= 5) return messages[1];
  if (value <= 8) return messages[2];
  return messages[3];
}

const RARITY_PALETTE = {
  ELITE: { color: '#FFD700', bg: 'rgba(255, 215, 0, 0.2)', label: 'ELITE' },
  PRO: { color: '#A855F7', bg: 'rgba(168, 85, 247, 0.2)', label: 'PRO' },
  AMATEUR: { color: '#00EAFF', bg: 'rgba(0, 234, 255, 0.2)', label: 'AMATEUR' },
  BASE: { color: '#E5E4E2', bg: 'rgba(229, 228, 226, 0.2)', label: 'BASE' },
};

function getRarity(value: number) {
  if (value >= 9) return RARITY_PALETTE.ELITE;
  if (value >= 7) return RARITY_PALETTE.PRO;
  if (value >= 5) return RARITY_PALETTE.AMATEUR;
  return RARITY_PALETTE.BASE;
}

export default function StatsRadarComponent({ stats, onStatChange, readonly = false }: StatsRadarProps) {
  return (
    <View style={styles.container}>
      {STAT_CONFIG.map((config) => {
        const value = stats[config.key];
        const message = getMessage(value, config.messages);
        const rarity = getRarity(value);

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

              <View style={[styles.statValueContainer, { borderColor: rarity.color + '60' }]}>
                <Text style={[styles.statValue, { color: rarity.color }]}>{value}</Text>
              </View>

              <View style={[styles.rarityBadge, { backgroundColor: rarity.bg }]}>
                <Text style={[styles.rarityText, { color: rarity.color }]}>
                  {rarity.label}
                </Text>
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
                  minimumTrackTintColor={rarity.color}
                  maximumTrackTintColor={Colors.dark.border}
                  thumbTintColor={rarity.color}
                />
                <Text style={styles.statMessage}>{message}</Text>
              </View>
            ) : (
              <View style={styles.barContainer}>
                <View style={[styles.bar, { width: `${value * 10}%`, backgroundColor: rarity.color }]} />
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
  statRow: {
    marginBottom: 20,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statIcon: {
    marginRight: 10,
  },
  statLabel: {
    color: Colors.dark.text,
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
    letterSpacing: 0.3,
  },
  statValueContainer: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    width: 40,
    height: 32,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '900',
  },
  rarityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    minWidth: 70,
    alignItems: 'center',
  },
  rarityText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  statMessage: {
    color: Colors.dark.textMuted,
    fontSize: 12,
    width: 75,
    textAlign: 'right',
    fontStyle: 'italic',
  },
  barContainer: {
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 5,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  bar: {
    height: '100%',
    borderRadius: 5,
  },
});

