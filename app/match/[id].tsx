import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  X,
  MapPin,
  Calendar,
  Users,
  Shield,
  DollarSign,
  Clock,
  Swords,
  Heart,
  UserPlus,
  ListOrdered,
  Zap,
  CheckCircle2,
  ParkingCircle as Car,
  Bath as Shower,
  Layers as Square,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useAppStore } from '@/store/useAppStore';
import { mockApi, getTotalSlots, getAvailableSlotForPosition } from '@/services/mockApi';
import {
  Match,
  UserProfile,
  MatchSlot,
  FORMAT_LABELS,
  MATCH_TYPE_LABELS,
  POSITION_LABELS,
  MatchTypeEnum,
  PositionEnum,
} from '@/types';

export default function MatchDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAppStore();

  const [match, setMatch] = useState<Match | null>(null);
  const [players, setPlayers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    const loadMatch = async () => {
      if (!id) return;

      setIsLoading(true);
      try {
        const matchData = await mockApi.getMatchById(id);
        setMatch(matchData);

        if (matchData) {
          const playerIds = matchData.slots.flatMap((s) => s.filled_by);
          const playersData = await mockApi.getUsersByIds(playerIds);
          setPlayers(playersData);
        }
      } catch (error) {
        console.error('[MatchDetail] Error loading match:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMatch();
  }, [id]);

  const averageLevel = useMemo(() => {
    if (players.length === 0) return (5.0).toFixed(1);
    const totalMedia = players.reduce((acc, player) => acc + (player.media || 5.0), 0);
    return (totalMedia / players.length).toFixed(1);
  }, [players]);

  const handleJoin = async () => {
    if (!match || !user) return;

    const availableSlot = getAvailableSlotForPosition(
      match,
      user.football_specs.main_position
    );

    if (!availableSlot) {
      Alert.alert('Sin Cupo', 'No hay lugares disponibles para tu posición');
      return;
    }

    setIsJoining(true);
    try {
      const success = await mockApi.joinMatch(match.id, availableSlot.id, user.id);
      if (success) {
        Alert.alert('¡Listo!', 'Te anotaste al partido', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      }
    } catch (error) {
      console.error('[MatchDetail] Error joining match:', error);
      Alert.alert('Error', 'No se pudo unir al partido');
    } finally {
      setIsJoining(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.dark.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!match) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Partido no encontrado</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const { filled, total } = getTotalSlots(match);
  const isFull = filled >= total;
  const availableSlot = user
    ? getAvailableSlotForPosition(match, user.football_specs.main_position)
    : null;
  const canJoin = !isFull && availableSlot;

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeTop}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => router.back()}
          >
            <X size={24} color={Colors.dark.text} />
          </TouchableOpacity>
          <View style={styles.formatBadge}>
            <Text style={styles.formatBadgeText}>{FORMAT_LABELS[match.format]}</Text>
          </View>
        </View>

        {Platform.OS !== 'web' && (
          <View style={styles.mapContainer}>
            <MapView
              style={styles.miniMap}
              initialRegion={{
                latitude: Number(match.location.latitude),
                longitude: Number(match.location.longitude),
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              scrollEnabled={false}
              zoomEnabled={false}
              rotateEnabled={false}
              pitchEnabled={false}
              customMapStyle={mapStyle}
              userInterfaceStyle="dark"
            >
              <Marker
                coordinate={{
                  latitude: Number(match.location.latitude),
                  longitude: Number(match.location.longitude),
                }}
              >
                <View style={styles.mapMarker}>
                  <MaterialCommunityIcons name="soccer" size={16} color="#000" />
                </View>
              </Marker>
            </MapView>
          </View>
        )}
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleSection}>
          <Text style={styles.title}>{match.title}</Text>
          <View style={styles.typeRow}>
            {match.type === MatchTypeEnum.CHILL ? (
              <Heart size={16} color={Colors.dark.accent} />
            ) : (
              <Swords size={16} color={Colors.dark.error} />
            )}
            <Text style={styles.typeText}>{MATCH_TYPE_LABELS[match.type]}</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <MapPin size={18} color={Colors.dark.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Ubicación</Text>
              <Text style={styles.infoValue}>{match.location.address}</Text>
            </View>
          </View>

          <View style={styles.infoDivider} />

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Calendar size={18} color={Colors.dark.accent} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Fecha</Text>
              <Text style={styles.infoValue}>{formatDate(match.date)}</Text>
            </View>
          </View>

          <View style={styles.infoDivider} />

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Clock size={18} color={Colors.dark.info} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Hora</Text>
              <Text style={styles.infoValue}>{formatTime(match.date)}</Text>
            </View>
          </View>

          <View style={styles.infoDivider} />

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <DollarSign size={18} color={Colors.dark.success} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Precio por jugador</Text>
              <Text style={styles.infoValue}>${match.price.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        <View style={styles.technicalRow}>
          <View style={styles.techItem}>
            <Square size={16} color={Colors.dark.primary} />
            <Text style={styles.techText}>Sintético</Text>
          </View>
          <View style={styles.techItem}>
            <Shower size={16} color={Colors.dark.info} />
            <Text style={styles.techText}>Vestuarios</Text>
          </View>
          <View style={styles.techItem}>
            <Car size={16} color={Colors.dark.textSecondary} />
            <Text style={styles.techText}>Parking</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nivel del Encuentro</Text>
          <View style={styles.levelCard}>
            <View style={styles.levelCircle}>
              <Text style={styles.levelNumber}>{averageLevel}</Text>
              <Text style={styles.levelLabel}>Media</Text>
            </View>
            <View style={styles.levelInfo}>
              <Text style={styles.levelTitle}>¡Partido de Nivel Pro!</Text>
              <Text style={styles.levelSubtitle}>Basado en el promedio de los anotados</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Cupos</Text>
            <View style={[styles.slotsBadge, isFull && styles.slotsBadgeFull]}>
              <Users size={14} color={isFull ? Colors.dark.error : Colors.dark.primary} />
              <Text style={[styles.slotsBadgeText, isFull && styles.slotsBadgeTextFull]}>
                {filled}/{total}
              </Text>
            </View>
          </View>

          {match.slots.map((slot) => (
            <SlotCard
              key={slot.id}
              slot={slot}
              players={players.filter((p) => slot.filled_by.includes(p.id))}
            />
          ))}
        </View>
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={styles.footer}>
        {canJoin ? (
          <TouchableOpacity
            style={styles.joinButton}
            onPress={handleJoin}
            disabled={isJoining}
            activeOpacity={0.8}
          >
            {isJoining ? (
              <ActivityIndicator color={Colors.dark.background} />
            ) : (
              <>
                <UserPlus size={20} color={Colors.dark.background} />
                <Text style={styles.joinButtonText}>Unirse al Partido</Text>
              </>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.joinButton, styles.waitlistButton]}
            activeOpacity={0.8}
          >
            <ListOrdered size={20} color={Colors.dark.text} />
            <Text style={styles.waitlistButtonText}>
              {isFull ? 'Lista de Espera' : 'Sin cupo para tu posición'}
            </Text>
          </TouchableOpacity>
        )}
      </SafeAreaView>
    </View>
  );
}

interface SlotCardProps {
  slot: MatchSlot;
  players: UserProfile[];
}

function SlotCard({ slot, players }: SlotCardProps) {
  const available = slot.quantity_needed - slot.filled_by.length;
  const positionColor = Colors.positions[slot.role];

  return (
    <View style={styles.slotCard}>
      <View style={styles.slotHeader}>
        <View style={[styles.slotIconContainer, { backgroundColor: positionColor + '20' }]}>
          <Shield size={18} color={positionColor} />
        </View>
        <Text style={styles.slotRole}>{POSITION_LABELS[slot.role]}</Text>
        <Text style={styles.slotCount}>
          {slot.filled_by.length}/{slot.quantity_needed}
        </Text>
      </View>

      <View style={styles.slotPlayers}>
        {players.map((player) => (
          <View key={player.id} style={styles.playerChip}>
            <Image
              source={{ uri: player.avatar_url }}
              style={styles.playerAvatar}
              contentFit="cover"
            />
            <Text style={styles.playerName}>{player.nickname}</Text>
          </View>
        ))}

        {Array.from({ length: available }).map((_, i) => (
          <View
            key={`empty-${i}`}
            style={[
              styles.emptySlot,
              slot.role === PositionEnum.GK && styles.emptySlotGK
            ]}
          >
            {slot.role === PositionEnum.GK ? (
              <View style={styles.gkPlaceholder}>
                <MaterialCommunityIcons name="hand-back-left" size={16} color="#FFD700" />
                <Text style={styles.emptySlotTextGK}>Arquero Disponible</Text>
              </View>
            ) : (
              <Text style={styles.emptySlotText}>Disponible</Text>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

const mapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#38414e' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#212a37' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#17263c' }] },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  safeTop: {
    backgroundColor: Colors.dark.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  errorText: {
    color: Colors.dark.textSecondary,
    fontSize: 16,
  },
  backButton: {
    backgroundColor: Colors.dark.surface,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: Colors.dark.text,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.dark.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formatBadge: {
    backgroundColor: Colors.dark.primaryGlow,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
  },
  formatBadgeText: {
    color: Colors.dark.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 160, // Extra space for safe area
  },
  mapContainer: {
    height: 120,
    marginHorizontal: 20,
    marginTop: 8,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  miniMap: {
    flex: 1,
  },
  mapMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.dark.primary,
    borderWidth: 3,
    borderColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleSection: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.dark.text,
    marginBottom: 8,
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  typeText: {
    color: Colors.dark.textSecondary,
    fontSize: 14,
  },
  infoCard: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.dark.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: Colors.dark.textMuted,
  },
  infoValue: {
    fontSize: 15,
    color: Colors.dark.text,
    fontWeight: '600',
  },
  infoDivider: {
    height: 1,
    backgroundColor: Colors.dark.border,
    marginVertical: 12,
    marginLeft: 48,
  },
  technicalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 10,
  },
  techItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  techText: {
    color: Colors.dark.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  levelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.surface,
    borderRadius: 20,
    padding: 16,
    gap: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  levelCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.dark.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  levelNumber: {
    fontSize: 20,
    fontWeight: '900',
    color: '#000',
  },
  levelLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#000',
    marginTop: -2,
    textTransform: 'uppercase',
  },
  levelInfo: {
    flex: 1,
  },
  levelTitle: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  levelSubtitle: {
    color: Colors.dark.textSecondary,
    fontSize: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.dark.text,
  },
  slotsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.dark.primaryGlow,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  slotsBadgeFull: {
    backgroundColor: Colors.dark.error + '20',
  },
  slotsBadgeText: {
    color: Colors.dark.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  slotsBadgeTextFull: {
    color: Colors.dark.error,
  },
  slotCard: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  slotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  slotIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotRole: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  slotCount: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    fontWeight: '600',
  },
  slotPlayers: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  playerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.surfaceLight,
    borderRadius: 20,
    paddingRight: 12,
    gap: 8,
  },
  playerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  playerName: {
    color: Colors.dark.text,
    fontSize: 13,
    fontWeight: '500',
  },
  emptySlot: {
    backgroundColor: Colors.dark.surfaceLight,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Colors.dark.border,
  },
  emptySlotGK: {
    borderColor: '#FFD700',
    backgroundColor: 'rgba(255, 215, 0, 0.05)',
  },
  gkPlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  emptySlotText: {
    color: Colors.dark.textMuted,
    fontSize: 12,
  },
  emptySlotTextGK: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '700',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 0 : 20, // SafeAreaView takes care of handle
    backgroundColor: Colors.dark.background,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
  },
  joinButton: {
    backgroundColor: Colors.dark.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  joinButtonText: {
    color: Colors.dark.background,
    fontSize: 18,
    fontWeight: '700',
  },
  waitlistButton: {
    backgroundColor: Colors.dark.surface,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  waitlistButtonText: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: '600',
  },
});
