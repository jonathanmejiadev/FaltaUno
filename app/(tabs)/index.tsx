import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';

import { 
  Filter, 
  MapPin, 
  Calendar,
  Users,
  Shield,
  Goal,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useAppStore } from '@/store/useAppStore';
import { mockApi, getTotalSlots } from '@/services/mockApi';
import { Match, FormatEnum, PositionEnum, FORMAT_LABELS } from '@/types';

const { width } = Dimensions.get('window');

const INITIAL_REGION = {
  latitude: -34.6037,
  longitude: -58.3816,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

function getMarkerIcon(match: Match) {
  const needsGK = match.slots.some(
    (s) => s.role === PositionEnum.GK && s.filled_by.length < s.quantity_needed
  );
  if (needsGK) return 'gloves';
  return 'ball';
}

export default function DiscoveryScreen() {
  const router = useRouter();
  const { selectedFormat, setSelectedFormat, user } = useAppStore();
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [, setIsLoading] = useState(true);

  const loadMatches = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await mockApi.getMatches(
        selectedFormat ? { format: selectedFormat } : undefined
      );
      setMatches(data);
      console.log('[Discovery] Loaded matches:', data.length);
    } catch (error) {
      console.error('[Discovery] Error loading matches:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedFormat]);

  useEffect(() => {
    loadMatches();
  }, [loadMatches]);

  const handleMarkerPress = (match: Match) => {
    setSelectedMatch(match);
  };

  const handleMatchCardPress = (match: Match) => {
    router.push(`/match/${match.id}`);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-AR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formats = [null, FormatEnum.F5, FormatEnum.F7, FormatEnum.F11];

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeTop}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>¡Hola, {user?.nickname || 'Crack'}!</Text>
            <Text style={styles.headerTitle}>Encontrá tu partido</Text>
          </View>
          <TouchableOpacity style={styles.filterButton}>
            <Filter size={20} color={Colors.dark.text} />
          </TouchableOpacity>
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContainer}
        >
          {formats.map((format) => (
            <TouchableOpacity
              key={format || 'all'}
              style={[
                styles.filterChip,
                selectedFormat === format && styles.filterChipActive,
              ]}
              onPress={() => setSelectedFormat(format)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedFormat === format && styles.filterChipTextActive,
                ]}
              >
                {format ? FORMAT_LABELS[format] : 'Todos'}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>

      <View style={styles.mapContainer}>
        {Platform.OS !== 'web' ? (
          <MapView
            style={styles.map}
            initialRegion={INITIAL_REGION}
            provider={PROVIDER_DEFAULT}
            showsUserLocation
            showsMyLocationButton={false}
            customMapStyle={mapStyle}
          >
            {matches.map((match) => {
              const icon = getMarkerIcon(match);
              return (
                <Marker
                  key={match.id}
                  coordinate={{
                    latitude: match.location.latitude,
                    longitude: match.location.longitude,
                  }}
                  onPress={() => handleMarkerPress(match)}
                >
                  <View style={styles.markerContainer}>
                    <View style={[
                      styles.marker,
                      selectedMatch?.id === match.id && styles.markerSelected,
                    ]}>
                      {icon === 'gloves' ? (
                        <Shield size={18} color={Colors.dark.goalkeeper} />
                      ) : (
                        <Goal size={18} color={Colors.dark.primary} />
                      )}
                    </View>
                  </View>
                </Marker>
              );
            })}
          </MapView>
        ) : (
          <View style={styles.webMapPlaceholder}>
            <MapPin size={48} color={Colors.dark.textMuted} />
            <Text style={styles.webMapText}>
              El mapa está disponible en la app móvil
            </Text>
            <Text style={styles.webMapSubtext}>
              {matches.length} partidos encontrados
            </Text>
          </View>
        )}
      </View>

      {selectedMatch ? (
        <TouchableOpacity
          style={styles.matchCard}
          onPress={() => handleMatchCardPress(selectedMatch)}
          activeOpacity={0.9}
        >
          <View style={styles.matchCardHeader}>
            <View style={styles.formatBadge}>
              <Text style={styles.formatBadgeText}>
                {FORMAT_LABELS[selectedMatch.format]}
              </Text>
            </View>
            <Text style={styles.matchPrice}>
              ${selectedMatch.price.toLocaleString()}
            </Text>
          </View>
          
          <Text style={styles.matchTitle}>{selectedMatch.title}</Text>
          
          <View style={styles.matchInfo}>
            <View style={styles.matchInfoRow}>
              <MapPin size={14} color={Colors.dark.textSecondary} />
              <Text style={styles.matchInfoText} numberOfLines={1}>
                {selectedMatch.location.address}
              </Text>
            </View>
            <View style={styles.matchInfoRow}>
              <Calendar size={14} color={Colors.dark.textSecondary} />
              <Text style={styles.matchInfoText}>
                {formatDate(selectedMatch.date)}
              </Text>
            </View>
          </View>

          <View style={styles.matchFooter}>
            <View style={styles.slotsInfo}>
              <Users size={16} color={Colors.dark.primary} />
              <Text style={styles.slotsText}>
                {getTotalSlots(selectedMatch).filled}/{getTotalSlots(selectedMatch).total} jugadores
              </Text>
            </View>
            <View style={styles.joinHint}>
              <Text style={styles.joinHintText}>Ver detalles →</Text>
            </View>
          </View>
        </TouchableOpacity>
      ) : (
        <View style={styles.matchListContainer}>
          <Text style={styles.matchListTitle}>Próximos partidos</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.matchList}
          >
            {matches.map((match) => (
              <TouchableOpacity
                key={match.id}
                style={styles.matchListCard}
                onPress={() => handleMatchCardPress(match)}
                activeOpacity={0.8}
              >
                <View style={styles.formatBadgeSmall}>
                  <Text style={styles.formatBadgeSmallText}>
                    {FORMAT_LABELS[match.format]}
                  </Text>
                </View>
                <Text style={styles.matchListCardTitle} numberOfLines={1}>
                  {match.title}
                </Text>
                <Text style={styles.matchListCardDate}>
                  {formatDate(match.date)}
                </Text>
                <View style={styles.matchListCardFooter}>
                  <Users size={12} color={Colors.dark.textMuted} />
                  <Text style={styles.matchListCardSlots}>
                    {getTotalSlots(match).filled}/{getTotalSlots(match).total}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
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
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  greeting: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.dark.text,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.dark.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filtersContainer: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.dark.surface,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: Colors.dark.primary,
  },
  filterChipText: {
    color: Colors.dark.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: Colors.dark.background,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  webMapPlaceholder: {
    flex: 1,
    backgroundColor: Colors.dark.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  webMapText: {
    color: Colors.dark.textSecondary,
    fontSize: 16,
  },
  webMapSubtext: {
    color: Colors.dark.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  markerContainer: {
    alignItems: 'center',
  },
  marker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.dark.surface,
    borderWidth: 2,
    borderColor: Colors.dark.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerSelected: {
    backgroundColor: Colors.dark.primaryGlow,
    transform: [{ scale: 1.1 }],
  },
  matchCard: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  matchCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  formatBadge: {
    backgroundColor: Colors.dark.primaryGlow,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  formatBadgeText: {
    color: Colors.dark.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  matchPrice: {
    color: Colors.dark.primary,
    fontSize: 18,
    fontWeight: '700',
  },
  matchTitle: {
    color: Colors.dark.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  matchInfo: {
    gap: 6,
    marginBottom: 12,
  },
  matchInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  matchInfoText: {
    color: Colors.dark.textSecondary,
    fontSize: 13,
    flex: 1,
  },
  matchFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
  },
  slotsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  slotsText: {
    color: Colors.dark.text,
    fontSize: 14,
    fontWeight: '600',
  },
  joinHint: {
    backgroundColor: Colors.dark.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  joinHintText: {
    color: Colors.dark.background,
    fontSize: 13,
    fontWeight: '600',
  },
  matchListContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.dark.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    paddingBottom: 20,
  },
  matchListTitle: {
    color: Colors.dark.text,
    fontSize: 18,
    fontWeight: '700',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  matchList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  matchListCard: {
    width: width * 0.6,
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 14,
    marginRight: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  formatBadgeSmall: {
    backgroundColor: Colors.dark.primaryGlow,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  formatBadgeSmallText: {
    color: Colors.dark.primary,
    fontSize: 10,
    fontWeight: '700',
  },
  matchListCardTitle: {
    color: Colors.dark.text,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  matchListCardDate: {
    color: Colors.dark.textSecondary,
    fontSize: 12,
    marginBottom: 8,
  },
  matchListCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  matchListCardSlots: {
    color: Colors.dark.textMuted,
    fontSize: 12,
  },
});
