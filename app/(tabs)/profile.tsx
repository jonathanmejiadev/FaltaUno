import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import {
  Settings,
  LogOut,
  MapPin,
  Trophy,
  Calendar,
  Edit3,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useAppStore } from '@/store/useAppStore';
import StatsRadarComponent from '@/components/StatsRadar';
import { POSITION_LABELS, FOOT_LABELS } from '@/types';

export default function ProfileScreen() {
  const { user, logout } = useAppStore();

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que querés salir?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Salir',
          style: 'destructive',
          onPress: () => logout(),
        },
      ]
    );
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No hay perfil cargado</Text>
        </View>
      </SafeAreaView>
    );
  }

  const avgRating = Math.round(
    Object.values(user.stats_radar).reduce((a, b) => a + b, 0) / 6
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.settingsButton}>
            <Settings size={22} color={Colors.dark.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={22} color={Colors.dark.error} />
          </TouchableOpacity>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: user.avatar_url }}
              style={styles.avatar}
              contentFit="cover"
            />
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingText}>{avgRating}</Text>
            </View>
            <TouchableOpacity style={styles.editAvatarButton}>
              <Edit3 size={14} color={Colors.dark.text} />
            </TouchableOpacity>
          </View>

          <Text style={styles.nickname}>{user.nickname}</Text>
          <Text style={styles.category}>{user.category}</Text>

          <View style={styles.positionBadge}>
            <Text style={styles.positionText}>
              {POSITION_LABELS[user.football_specs.main_position]} • {user.football_specs.specific_role}
            </Text>
          </View>

          <View style={styles.quickStats}>
            <View style={styles.quickStatItem}>
              <Text style={styles.quickStatValue}>
                {FOOT_LABELS[user.football_specs.dominant_foot]}
              </Text>
              <Text style={styles.quickStatLabel}>Pie</Text>
            </View>
            <View style={styles.quickStatDivider} />
            <View style={styles.quickStatItem}>
              <Text style={styles.quickStatValue}>
                {user.is_versatile ? 'Sí' : 'No'}
              </Text>
              <Text style={styles.quickStatLabel}>Versátil</Text>
            </View>
            <View style={styles.quickStatDivider} />
            <View style={styles.quickStatItem}>
              <Text style={styles.quickStatValue}>12</Text>
              <Text style={styles.quickStatLabel}>Partidos</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mi Ficha Técnica</Text>
          <StatsRadarComponent
            stats={user.stats_radar}
            onStatChange={() => {}}
            readonly
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actividad Reciente</Text>
          
          <View style={styles.activityCard}>
            <View style={styles.activityIcon}>
              <Trophy size={20} color={Colors.dark.primary} />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Picadito del Viernes</Text>
              <Text style={styles.activitySubtitle}>Jugaste hace 3 días</Text>
            </View>
            <View style={styles.activityBadge}>
              <Text style={styles.activityBadgeText}>MVP</Text>
            </View>
          </View>

          <View style={styles.activityCard}>
            <View style={styles.activityIcon}>
              <Calendar size={20} color={Colors.dark.accent} />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Liga Barrial - Fecha 3</Text>
              <Text style={styles.activitySubtitle}>Anotado para mañana</Text>
            </View>
          </View>

          <View style={styles.activityCard}>
            <View style={styles.activityIcon}>
              <MapPin size={20} color={Colors.dark.info} />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Cancha Los Amigos</Text>
              <Text style={styles.activitySubtitle}>Tu cancha más visitada</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.dark.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.dark.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileCard: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: Colors.dark.primary,
  },
  ratingBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.dark.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.dark.surface,
  },
  ratingText: {
    color: Colors.dark.background,
    fontSize: 14,
    fontWeight: '800',
  },
  editAvatarButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.dark.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.dark.surface,
  },
  nickname: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.dark.text,
    marginBottom: 4,
  },
  category: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    marginBottom: 12,
  },
  positionBadge: {
    backgroundColor: Colors.dark.primaryGlow,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20,
  },
  positionText: {
    color: Colors.dark.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  quickStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickStatItem: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  quickStatValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.dark.text,
  },
  quickStatLabel: {
    fontSize: 12,
    color: Colors.dark.textMuted,
    marginTop: 2,
  },
  quickStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: Colors.dark.border,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.dark.text,
    marginBottom: 16,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.dark.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  activitySubtitle: {
    fontSize: 13,
    color: Colors.dark.textSecondary,
    marginTop: 2,
  },
  activityBadge: {
    backgroundColor: Colors.dark.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  activityBadgeText: {
    color: Colors.dark.background,
    fontSize: 11,
    fontWeight: '700',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: Colors.dark.textSecondary,
    fontSize: 16,
  },
});
