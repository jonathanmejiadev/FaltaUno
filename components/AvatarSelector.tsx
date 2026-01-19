import React from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { Check } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface AvatarSelectorProps {
  avatars: string[];
  selectedAvatar: string;
  onSelectAvatar: (avatar: string) => void;
}

export default function AvatarSelector({ avatars, selectedAvatar, onSelectAvatar }: AvatarSelectorProps) {
  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {avatars.map((avatar, index) => {
        const isSelected = selectedAvatar === avatar;
        
        return (
          <TouchableOpacity
            key={index}
            style={[styles.avatarContainer, isSelected && styles.avatarContainerSelected]}
            onPress={() => onSelectAvatar(avatar)}
            activeOpacity={0.7}
          >
            <Image
              source={{ uri: avatar }}
              style={styles.avatar}
              contentFit="cover"
            />
            {isSelected && (
              <View style={styles.checkBadge}>
                <Check size={16} color={Colors.dark.background} strokeWidth={3} />
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 4,
    gap: 12,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: Colors.dark.border,
    overflow: 'hidden',
    position: 'relative',
  },
  avatarContainerSelected: {
    borderColor: Colors.dark.primary,
    borderWidth: 3,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  checkBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.dark.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
