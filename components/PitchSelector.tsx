import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { PositionEnum, POSITION_LABELS } from '@/types';
import Colors from '@/constants/colors';

interface PitchSelectorProps {
  selectedPosition: PositionEnum;
  onSelectPosition: (position: PositionEnum) => void;
}

export default function PitchSelector({ selectedPosition, onSelectPosition }: PitchSelectorProps) {
  const positions = [
    { position: PositionEnum.GK, top: '78%', left: '50%', label: 'POR' },
    { position: PositionEnum.DEF, top: '58%', left: '50%', label: 'DEF' },
    { position: PositionEnum.MID, top: '38%', left: '50%', label: 'MED' },
    { position: PositionEnum.FWD, top: '18%', left: '50%', label: 'DEL' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.pitch}>
        <View style={styles.centerCircle} />
        <View style={styles.centerLine} />
        <View style={styles.penaltyArea} />
        <View style={styles.goalArea} />
        <View style={styles.penaltyAreaTop} />
        <View style={styles.goalAreaTop} />
        
        {positions.map((pos) => {
          const isSelected = selectedPosition === pos.position;
          const positionColor = Colors.positions[pos.position];
          
          return (
            <TouchableOpacity
              key={pos.position}
              style={[
                styles.positionButton,
                { top: pos.top, left: pos.left },
                isSelected && { backgroundColor: positionColor, borderColor: positionColor },
              ]}
              onPress={() => onSelectPosition(pos.position)}
              activeOpacity={0.7}
            >
              <Text style={[styles.positionLabel, isSelected && styles.positionLabelSelected]}>
                {pos.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      
      <View style={styles.selectedInfo}>
        <Text style={styles.selectedText}>
          Posición: <Text style={[styles.selectedValue, { color: Colors.positions[selectedPosition] }]}>
            {POSITION_LABELS[selectedPosition]}
          </Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  pitch: {
    width: 280,
    height: 380,
    backgroundColor: Colors.dark.pitch,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: Colors.dark.pitchLines,
    position: 'relative',
    overflow: 'hidden',
  },
  centerLine: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: Colors.dark.pitchLines,
  },
  centerCircle: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: Colors.dark.pitchLines,
    transform: [{ translateX: -30 }, { translateY: -30 }],
  },
  penaltyArea: {
    position: 'absolute',
    bottom: 0,
    left: '15%',
    width: '70%',
    height: '20%',
    borderWidth: 2,
    borderColor: Colors.dark.pitchLines,
    borderBottomWidth: 0,
  },
  goalArea: {
    position: 'absolute',
    bottom: 0,
    left: '30%',
    width: '40%',
    height: '10%',
    borderWidth: 2,
    borderColor: Colors.dark.pitchLines,
    borderBottomWidth: 0,
  },
  penaltyAreaTop: {
    position: 'absolute',
    top: 0,
    left: '15%',
    width: '70%',
    height: '20%',
    borderWidth: 2,
    borderColor: Colors.dark.pitchLines,
    borderTopWidth: 0,
  },
  goalAreaTop: {
    position: 'absolute',
    top: 0,
    left: '30%',
    width: '40%',
    height: '10%',
    borderWidth: 2,
    borderColor: Colors.dark.pitchLines,
    borderTopWidth: 0,
  },
  positionButton: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.dark.surface,
    borderWidth: 2,
    borderColor: Colors.dark.border,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateX: -28 }, { translateY: -28 }],
  },
  positionLabel: {
    color: Colors.dark.textSecondary,
    fontSize: 14,
    fontWeight: '700',
  },
  positionLabelSelected: {
    color: Colors.dark.background,
  },
  selectedInfo: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
  },
  selectedText: {
    color: Colors.dark.textSecondary,
    fontSize: 16,
  },
  selectedValue: {
    fontWeight: '700',
  },
});
