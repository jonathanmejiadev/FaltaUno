import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  Alert,
  Modal,
  Dimensions,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  MapPin,
  Calendar,
  Plus,
  Minus,
  Shield,
  Users,
  Swords,
  Heart,
  Trash2,
  Check,
  Search,
  ChevronDown,
  Zap,
  CheckCircle2,
} from 'lucide-react-native';
import { GooglePlacesAutocomplete, GooglePlacesAutocompleteRef } from 'react-native-google-places-autocomplete';
import Colors from '@/constants/colors';
import { GOOGLE_PLACES_API_KEY } from '@/constants/Config';
import { useAppStore } from '@/store/useAppStore';
import { mockApi } from '@/services/mockApi';
import {
  FormatEnum,
  MatchTypeEnum,
  SurfaceEnum,
  PositionEnum,
  FORMAT_LABELS,
  FORMAT_PLAYERS,
  MATCH_TYPE_LABELS,
  SURFACE_LABELS,
  POSITION_LABELS,
  MatchSlot,
  Match,
  AgeCategoryEnum,
  AGE_CATEGORY_LABELS,
} from '@/types';

interface SlotInput {
  id: string;
  role: PositionEnum;
  quantity: number;
}

const POSITION_ABBR: Record<string, string> = {
  [PositionEnum.GK]: 'ARQ',
  [PositionEnum.DEF]: 'DEF',
  [PositionEnum.MID]: 'MED',
  [PositionEnum.FWD]: 'DEL',
  [PositionEnum.ANY]: 'LIB',
};

const POSITION_ICONS: Record<string, any> = {
  [PositionEnum.GK]: { type: 'material', name: 'hand-back-left' },
  [PositionEnum.DEF]: { type: 'lucide', name: Shield },
  [PositionEnum.MID]: { type: 'material', name: 'soccer' },
  [PositionEnum.FWD]: { type: 'lucide', name: Zap },
  [PositionEnum.ANY]: { type: 'lucide', name: Users },
};

export default function CreateMatchScreen() {
  const router = useRouter();
  const { user, createMatch, updateMatch, matches } = useAppStore();
  const { editId } = useLocalSearchParams<{ editId: string }>();
  const googleRef = React.useRef<GooglePlacesAutocompleteRef>(null);

  const [title, setTitle] = useState('');
  const hasLoadedRef = React.useRef(false);
  const [format, setFormat] = useState<FormatEnum>(FormatEnum.F5);
  const [matchType, setMatchType] = useState<MatchTypeEnum>(MatchTypeEnum.CHILL);
  const [surface, setSurface] = useState<SurfaceEnum>(SurfaceEnum.SYNTHETIC);
  const [address, setAddress] = useState('');
  const [date, setDate] = useState(new Date(Date.now() + 24 * 60 * 60 * 1000));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [price, setPrice] = useState('5000');
  const [organizerPosition, setOrganizerPosition] = useState<PositionEnum>(
    user?.football_specs.main_position || PositionEnum.MID
  );
  const [ageCategories, setAgeCategories] = useState<AgeCategoryEnum[]>(
    user?.category ? [user.category as AgeCategoryEnum] : [AgeCategoryEnum.OPEN]
  );
  const [slots, setSlots] = useState<SlotInput[]>([
    { id: '1', role: PositionEnum.GK, quantity: 2 },
    { id: '2', role: PositionEnum.ANY, quantity: 8 },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [locationCoords, setLocationCoords] = useState<{ lat: number, lng: number } | null>(null);
  const [showLocationList, setShowLocationList] = useState(false);

  const NEARBY_COMPLEXES = [
    'Cancha Los Amigos, Palermo',
    'Complejo El Crack, Caballito',
    'Club Atlético Barrio Norte',
    'Canchas San Telmo',
    'Estadio Parque Chacabuco',
    'Metrogol, Colegiales',
  ];

  const toggleAgeCategory = (cat: AgeCategoryEnum) => {
    if (cat === AgeCategoryEnum.OPEN) {
      setAgeCategories([AgeCategoryEnum.OPEN]);
    } else {
      setAgeCategories(prev => {
        let next = prev.filter(c => c !== AgeCategoryEnum.OPEN);
        if (next.includes(cat)) {
          next = next.filter(c => c !== cat);
        } else {
          next = [...next, cat];
        }
        return next.length === 0 ? [AgeCategoryEnum.OPEN] : next;
      });
    }
  };

  // Sincronizar cupos por defecto al cambiar el formato (Solo si es un partido nuevo)
  useEffect(() => {
    if (editId) return;

    const totalNeeded = FORMAT_PLAYERS[format];
    const gkCount = 2; // Siempre 2 arqueros por defecto

    let newSlots: SlotInput[] = [];

    // Si el organizador es Arquero, simplemente dividimos 2 GK y el resto ANY
    if (organizerPosition === PositionEnum.GK) {
      newSlots = [
        { id: '1', role: PositionEnum.GK, quantity: gkCount },
        { id: '2', role: PositionEnum.ANY, quantity: totalNeeded - gkCount },
      ];
    } else {
      // Si el organizador juega en otra posición, creamos el slot específico para él
      // Escala: 1 Organizador (de su rol), 2 GK, resto ANY
      newSlots = [
        { id: '1', role: organizerPosition, quantity: 1 },
        { id: '2', role: PositionEnum.GK, quantity: gkCount },
        { id: '3', role: PositionEnum.ANY, quantity: totalNeeded - gkCount - 1 },
      ];
    }

    setSlots(newSlots);
  }, [format, editId]); // No incluimos organizerPosition aquí para no resetear cantidades personalizadas al cambiar solo el rol

  useEffect(() => {
    if (editId && !hasLoadedRef.current) {
      loadMatchForEdit();
    }
  }, [editId, matches]);

  const loadMatchForEdit = async () => {
    if (hasLoadedRef.current) return;
    setIsLoading(true);
    try {
      // Priorizar búsqueda en el Store global
      const { matches: currentMatches } = useAppStore.getState();
      const match = currentMatches.find(m => m.id === editId) || await mockApi.getMatchById(editId!);

      if (match) {
        hasLoadedRef.current = true;
        setTitle(match.title);
        setFormat(match.format);
        setMatchType(match.type);
        setSurface(match.surface);
        setAddress(match.location.address);
        if (match.ageCategory) setAgeCategories(Array.isArray(match.ageCategory) ? match.ageCategory : [match.ageCategory]);

        // Actualizar el texto visual del buscador de Google
        if (googleRef.current) {
          googleRef.current.setAddressText(match.location.address);
        }

        setLocationCoords({
          lat: match.location.latitude,
          lng: match.location.longitude
        });
        setDate(new Date(match.date));
        setPrice(match.price.toString());
        setSlots(match.slots.map(s => ({
          id: s.id,
          role: s.role,
          quantity: s.quantity_needed
        })));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  // Sincronizar el texto de Google Places cuando el ref esté listo
  useEffect(() => {
    if (editId && address && googleRef.current) {
      googleRef.current.setAddressText(address);
    }
  }, [editId, address, googleRef.current]);

  const handleOrganizerPositionChange = (newPos: PositionEnum) => {
    const oldPos = organizerPosition;
    if (newPos === oldPos) return;

    setOrganizerPosition(newPos);

    // Solo ajustamos slots si no estamos editando (en creación)
    if (!editId) {
      setSlots(prev => {
        let next = [...prev];

        // 1. Quitar al organizador del slot anterior (lógica de resta inteligente)
        const oldIdx = next.findIndex(s => s.role === oldPos);
        if (oldIdx > -1) {
          if (next[oldIdx].quantity > 1) {
            next[oldIdx] = { ...next[oldIdx], quantity: next[oldIdx].quantity - 1 };
          } else if (next[oldIdx].role !== PositionEnum.GK && next[oldIdx].role !== PositionEnum.ANY) {
            // Si el cupo era solo para él y no es posición básica, se borra
            next.splice(oldIdx, 1);
          } else {
            // Si es GK o ANY y llegaría a 0, tratamos de mantenerlo en 1 por consistencia visual
            next[oldIdx] = { ...next[oldIdx], quantity: Math.max(0, next[oldIdx].quantity - 1) };
          }
        }

        // 2. Agregar al organizador al nuevo slot
        const newIdx = next.findIndex(s => s.role === newPos);
        if (newIdx > -1) {
          next[newIdx] = { ...next[newIdx], quantity: next[newIdx].quantity + 1 };
        } else {
          next.push({ id: Date.now().toString(), role: newPos, quantity: 1 });
        }

        return next;
      });
    }
  };

  const totalPlayers = slots.reduce((acc, s) => acc + s.quantity, 0);
  const suggestedPlayers = FORMAT_PLAYERS[format];

  const addSlot = (role: PositionEnum) => {
    // Evitar duplicados
    if (slots.some(s => s.role === role)) return;

    const newSlot: SlotInput = {
      id: Date.now().toString(),
      role,
      quantity: role === PositionEnum.GK ? 2 : 2,
    };
    setSlots([...slots, newSlot]);
  };

  const removeSlot = (id: string) => {
    if (slots.length > 1) {
      setSlots(slots.filter((s) => s.id !== id));
    }
  };

  const updateSlotQuantity = (id: string, delta: number) => {
    setSlots(
      slots.map((s) => {
        if (s.id === id) {
          const newQty = Math.max(1, s.quantity + delta);
          return { ...s, quantity: newQty };
        }
        return s;
      })
    );
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      const newDate = new Date(date);
      newDate.setFullYear(selectedDate.getFullYear());
      newDate.setMonth(selectedDate.getMonth());
      newDate.setDate(selectedDate.getDate());
      setDate(newDate);
    }
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    if (selectedTime) {
      const newDate = new Date(date);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      setDate(newDate);
    }
  };

  const handleCreate = async () => {
    if (!title.trim() || !address.trim()) {
      Alert.alert('Error', 'Completá todos los campos');
      return;
    }

    setIsLoading(true);

    try {
      const newMatchData = {
        title: title || `Partido de ${FORMAT_LABELS[format]}`,
        format,
        type: matchType,
        surface,
        location: {
          address: address || 'Cancha por definir',
          latitude: locationCoords?.lat || -34.6037 + (Math.random() - 0.5) * 0.05,
          longitude: locationCoords?.lng || -58.3816 + (Math.random() - 0.5) * 0.05,
        },
        date,
        price: parseInt(price),
        organizer_id: user?.id || '1',
        ageCategory: ageCategories,
        slots: (() => {
          let assigned = false;
          return slots.map((s) => {
            const isOrganizerSlot = !editId && s.role === organizerPosition && !assigned;
            if (isOrganizerSlot) assigned = true;
            const filled_by = isOrganizerSlot ? [user?.id].filter(Boolean) : [];
            return {
              id: s.id,
              role: s.role,
              quantity_needed: s.quantity,
              filled_by: filled_by as string[],
            };
          });
        })(),
        requests: [],
        waitlist: [],
      };

      if (editId) {
        await updateMatch({ ...newMatchData, id: editId } as Match);
      } else {
        await createMatch({ ...newMatchData, id: `match_${Date.now()}` } as Match);
      }

      // Simular delay visual
      setTimeout(() => {
        setIsLoading(false);
        setShowSuccessModal(true);
      }, 1500);
    } catch (error) {
      setIsLoading(false);
      Alert.alert('Error', 'No se pudo guardar el partido');
    }
  };

  const formatDate = (d: Date) => {
    return d.toLocaleDateString('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  const formatTime = (d: Date) => {
    return d.toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={[]}
        renderItem={null}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <Text style={styles.title}>
                {editId ? 'Editar Partido' : 'Crear Partido'}
              </Text>
              <Text style={styles.subtitle}>
                {editId ? 'Ajusta los detalles de tu evento' : 'Completa los detalles para tu próximo partido'}
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Nombre del Partido</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Picadito del Viernes"
                placeholderTextColor={Colors.dark.textMuted}
                value={title}
                onChangeText={setTitle}
                maxLength={40}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Formato</Text>
              <View style={styles.formatChipsRow}>
                {Object.values(FormatEnum).map((f) => {
                  const num = f.replace('F', '');
                  return (
                    <TouchableOpacity
                      key={f}
                      style={[styles.formatChip, format === f && styles.formatChipActive]}
                      onPress={() => setFormat(f)}
                    >
                      <Text
                        style={[
                          styles.formatChipText,
                          format === f && styles.formatChipTextActive,
                        ]}
                      >
                        {num}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {!editId && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>¿En qué posición vas a jugar vos?</Text>
                <View style={styles.organizerPosRow}>
                  {[PositionEnum.GK, PositionEnum.DEF, PositionEnum.MID, PositionEnum.FWD, PositionEnum.ANY].map((pos) => {
                    const isSelected = organizerPosition === pos;
                    const posColor = Colors.positions[pos];
                    const iconConfig = POSITION_ICONS[pos];

                    return (
                      <TouchableOpacity
                        key={pos}
                        style={[
                          styles.posChip,
                          isSelected && { borderColor: posColor, backgroundColor: posColor + '20' }
                        ]}
                        onPress={() => handleOrganizerPositionChange(pos)}
                      >
                        {iconConfig.type === 'lucide' ? (
                          <iconConfig.name
                            size={18}
                            color={isSelected ? posColor : Colors.dark.textSecondary}
                          />
                        ) : (
                          <MaterialCommunityIcons
                            name={iconConfig.name}
                            size={18}
                            color={isSelected ? posColor : Colors.dark.textSecondary}
                          />
                        )}
                        <Text style={[
                          styles.posChipText,
                          isSelected && { color: posColor }
                        ]}>
                          {POSITION_ABBR[pos]}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tipo de Partido</Text>
              <View style={styles.typeRow}>
                {/* CHILL - AMARILLO */}
                <View style={styles.typeWrapper}>
                  <TouchableOpacity
                    style={[
                      styles.typeButton,
                      matchType === MatchTypeEnum.CHILL && {
                        borderColor: '#FFD600',
                        backgroundColor: '#FFD60015',
                        shadowColor: '#FFD600',
                        shadowOpacity: 0.3,
                        shadowRadius: 10,
                        elevation: 5
                      },
                    ]}
                    onPress={() => setMatchType(MatchTypeEnum.CHILL)}
                  >
                    <Heart
                      size={18}
                      color={matchType === MatchTypeEnum.CHILL ? '#FFD600' : Colors.dark.textSecondary}
                    />
                    <Text
                      style={[
                        styles.typeButtonText,
                        matchType === MatchTypeEnum.CHILL && { color: '#FFD600' },
                      ]}
                    >
                      {MATCH_TYPE_LABELS[MatchTypeEnum.CHILL]}
                    </Text>
                  </TouchableOpacity>
                  <Text style={styles.typeDesc}>Para divertirse</Text>
                </View>

                {/* COMPETITIVE - NARANJA */}
                <View style={styles.typeWrapper}>
                  <TouchableOpacity
                    style={[
                      styles.typeButton,
                      matchType === MatchTypeEnum.COMPETITIVE && {
                        borderColor: '#FF9100',
                        backgroundColor: '#FF910015',
                        shadowColor: '#FF9100',
                        shadowOpacity: 0.3,
                        shadowRadius: 10,
                        elevation: 5
                      },
                    ]}
                    onPress={() => setMatchType(MatchTypeEnum.COMPETITIVE)}
                  >
                    <Swords
                      size={18}
                      color={matchType === MatchTypeEnum.COMPETITIVE ? '#FF9100' : Colors.dark.textSecondary}
                    />
                    <Text
                      style={[
                        styles.typeButtonText,
                        matchType === MatchTypeEnum.COMPETITIVE && { color: '#FF9100' },
                      ]}
                    >
                      {MATCH_TYPE_LABELS[MatchTypeEnum.COMPETITIVE]}
                    </Text>
                  </TouchableOpacity>
                  <Text style={styles.typeDesc}>Ritmo alto</Text>
                </View>

                {/* PRO - ROJO */}
                <View style={styles.typeWrapper}>
                  <TouchableOpacity
                    style={[
                      styles.typeButton,
                      matchType === MatchTypeEnum.PRO && {
                        borderColor: '#FF3D00',
                        backgroundColor: '#FF3D0015',
                        shadowColor: '#FF3D00',
                        shadowOpacity: 0.3,
                        shadowRadius: 10,
                        elevation: 5
                      },
                    ]}
                    onPress={() => setMatchType(MatchTypeEnum.PRO)}
                  >
                    <Zap
                      size={18}
                      color={matchType === MatchTypeEnum.PRO ? '#FF3D00' : Colors.dark.textSecondary}
                    />
                    <Text
                      style={[
                        styles.typeButtonText,
                        matchType === MatchTypeEnum.PRO && { color: '#FF3D00' },
                      ]}
                    >
                      {MATCH_TYPE_LABELS[MatchTypeEnum.PRO]}
                    </Text>
                  </TouchableOpacity>
                  <Text style={styles.typeDesc}>Nivel experto</Text>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tipo de Suelo</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.surfaceScrollContent}
              >
                {[
                  { id: SurfaceEnum.SYNTHETIC, icon: 'checkerboard', label: 'Sintético' },
                  { id: SurfaceEnum.GRASS, icon: 'grass', label: 'Césped' },
                  { id: SurfaceEnum.FUTSAL, icon: 'stadium-variant', label: 'Futsal' },
                  { id: SurfaceEnum.PARQUET, icon: 'domain', label: 'Parquet' },
                  { id: SurfaceEnum.DIRT, icon: 'terrain', label: 'Tierra' },
                ].map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.surfaceChip,
                      surface === item.id && styles.surfaceChipActive,
                    ]}
                    onPress={() => setSurface(item.id as SurfaceEnum)}
                  >
                    <MaterialCommunityIcons
                      name={item.icon as any}
                      size={18}
                      color={surface === item.id ? Colors.dark.primary : Colors.dark.textSecondary}
                    />
                    <Text style={[
                      styles.surfaceChipText,
                      surface === item.id && styles.surfaceChipTextActive
                    ]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Ubicación</Text>
              <View style={{ position: 'relative' }}>
                <View style={styles.googleIconContainer}>
                  <MaterialCommunityIcons name="map-marker-radius" size={22} color={Colors.dark.primary} />
                </View>
                <GooglePlacesAutocomplete
                  ref={googleRef}
                  placeholder='Buscar cancha o club...'
                  textInputProps={{
                    placeholderTextColor: Colors.dark.textMuted,
                  }}
                  onPress={(data, details = null) => {
                    setAddress(data.description);
                    if (details) {
                      setLocationCoords({
                        lat: details.geometry.location.lat,
                        lng: details.geometry.location.lng,
                      });
                    }
                  }}
                  query={{
                    key: GOOGLE_PLACES_API_KEY,
                    language: 'es',
                    types: 'establishment',
                    location: '-34.6037,-58.3816',
                    radius: '10000',
                    keyword: 'fútbol',
                  }}
                  fetchDetails={true}
                  onFail={(error) => console.error('[GooglePlacesAutocomplete] Error:', error)}
                  onNotFound={() => console.warn('[GooglePlacesAutocomplete] No se encontraron resultados')}
                  timeout={15000}
                  debounce={400}
                  minLength={2}
                  styles={{
                    container: { flex: 0 },
                    textInput: styles.googleInput,
                    listView: styles.googleListView,
                    row: styles.googleRow,
                    description: styles.googleText,
                    separator: styles.googleSeparator,
                  }}
                  enablePoweredByContainer={false}
                />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Fecha y Hora</Text>
              <View style={styles.dateTimeRow}>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Calendar size={18} color={Colors.dark.textSecondary} />
                  <Text style={styles.dateButtonText}>{formatDate(date)}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.timeButton}
                  onPress={() => setShowTimePicker(true)}
                >
                  <Text style={styles.timeButtonText}>{formatTime(date)}</Text>
                </TouchableOpacity>
              </View>

              {/* Date Picker Modal */}
              {showDatePicker && ( // Conditionally render DateTimePicker for Android to avoid modal issues
                <Modal
                  visible={showDatePicker}
                  transparent
                  animationType="slide"
                  onRequestClose={() => setShowDatePicker(false)}
                >
                  <View style={styles.modalOverlay}>
                    <TouchableOpacity
                      style={styles.modalDismiss}
                      onPress={() => setShowDatePicker(false)}
                    />
                    <View style={styles.modalContent}>
                      <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Seleccionar Fecha</Text>
                        <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                          <Text style={styles.modalDone}>Listo</Text>
                        </TouchableOpacity>
                      </View>
                      <DateTimePicker
                        value={date}
                        mode="date"
                        display="spinner"
                        onChange={onDateChange}
                        minimumDate={new Date()}
                        themeVariant="dark"
                        textColor="#fff"
                      />
                    </View>
                  </View>
                </Modal>
              )}


              {/* Time Picker Modal */}
              {showTimePicker && ( // Conditionally render DateTimePicker for Android to avoid modal issues
                <Modal
                  visible={showTimePicker}
                  transparent
                  animationType="slide"
                  onRequestClose={() => setShowTimePicker(false)}
                >
                  <View style={styles.modalOverlay}>
                    <TouchableOpacity
                      style={styles.modalDismiss}
                      onPress={() => setShowTimePicker(false)}
                    />
                    <View style={styles.modalContent}>
                      <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Seleccionar Hora</Text>
                        <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                          <Text style={styles.modalDone}>Listo</Text>
                        </TouchableOpacity>
                      </View>
                      <DateTimePicker
                        value={date}
                        mode="time"
                        display="spinner"
                        onChange={onTimeChange}
                        themeVariant="dark"
                        textColor="#fff"
                      />
                    </View>
                  </View>
                </Modal>
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Categoría de Edad</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalScroll}
              >
                {Object.values(AgeCategoryEnum).map((cat) => {
                  const isSelected = ageCategories.includes(cat);
                  const isElite = cat === AgeCategoryEnum.ELITE;
                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.ageChip,
                        isSelected && styles.ageChipSelected,
                        isElite && !isSelected && styles.eliteChipOutline
                      ]}
                      onPress={() => toggleAgeCategory(cat)}
                    >
                      <View style={styles.chipContent}>
                        {isElite && (
                          <Zap size={14} color={isSelected ? Colors.dark.background : Colors.dark.accent} style={{ marginRight: 4 }} />
                        )}
                        <Text
                          style={[
                            styles.ageChipText,
                            isSelected && styles.ageChipTextSelected,
                            isElite && !isSelected && { color: Colors.dark.accent }
                          ]}
                        >
                          {AGE_CATEGORY_LABELS[cat]}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Precio por Jugador</Text>
              <View style={styles.inputWithIcon}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={styles.inputFlex}
                  placeholder="5000"
                  placeholderTextColor={Colors.dark.textMuted}
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.slotsSectionHeader}>
                <Text style={styles.sectionTitle}>Cupos</Text>
                <View style={[
                  styles.playerCountBadge,
                  totalPlayers === suggestedPlayers && styles.playerCountBadgeCorrect,
                ]}>
                  <Text style={[
                    styles.playerCountText,
                    totalPlayers === suggestedPlayers && styles.playerCountTextCorrect,
                  ]}>
                    Ocupados: {(() => {
                      if (!editId) return '1';
                      // Intentamos obtener el total real de inscritos si estamos editando
                      const { matches: currentMatches } = useAppStore.getState();
                      const currentMatch = currentMatches.find(m => m.id === editId);
                      if (!currentMatch) return '?';
                      return currentMatch.slots.reduce((acc, s) => acc + s.filled_by.length, 0);
                    })()}/{totalPlayers}
                  </Text>
                </View>
              </View>

              {(() => {
                let organizerAssigned = false;
                return slots.map((slot) => {
                  const takesOrganizer = !editId && slot.role === organizerPosition && !organizerAssigned;
                  if (takesOrganizer) organizerAssigned = true;

                  return (
                    <View key={slot.id} style={[styles.slotRow, takesOrganizer && styles.slotRowOrganizer]}>
                      <View style={[styles.slotIcon, { backgroundColor: slot.role === PositionEnum.GK ? '#FFD60020' : Colors.positions[slot.role] + '20' }]}>
                        {(() => {
                          const iconConfig = POSITION_ICONS[slot.role];
                          const color = slot.role === PositionEnum.GK ? '#FFD600' : Colors.positions[slot.role];
                          if (iconConfig.type === 'lucide') {
                            return <iconConfig.name size={18} color={color} />;
                          }
                          return <MaterialCommunityIcons name={iconConfig.name} size={18} color={color} />;
                        })()}
                        {takesOrganizer && (
                          <View style={styles.organizerMiniCrown}>
                            <MaterialCommunityIcons name="crown" size={8} color="#FFD700" />
                          </View>
                        )}
                      </View>
                      <View style={styles.slotInfoContainer}>
                        <Text style={styles.slotName}>{POSITION_LABELS[slot.role]}</Text>
                        {takesOrganizer && <Text style={styles.organizerInSlotText}>Tu posición</Text>}
                      </View>

                      <View style={styles.slotControls}>
                        <TouchableOpacity
                          style={styles.slotControlButton}
                          onPress={() => updateSlotQuantity(slot.id, -1)}
                        >
                          <Minus size={16} color={Colors.dark.text} />
                        </TouchableOpacity>
                        <Text style={styles.slotQuantity}>
                          {(() => {
                            if (editId) {
                              // Si estamos editando, mostraría por ej 5/10
                              // Por ahora mantenemos la lógica de visualización de creación
                              return `0/${slot.quantity}`;
                            }
                            return takesOrganizer ? `1/${slot.quantity}` : `0/${slot.quantity}`;
                          })()}
                        </Text>
                        <TouchableOpacity
                          style={styles.slotControlButton}
                          onPress={() => updateSlotQuantity(slot.id, 1)}
                        >
                          <Plus size={16} color={Colors.dark.text} />
                        </TouchableOpacity>
                      </View>

                      <TouchableOpacity
                        style={styles.slotDeleteButton}
                        onPress={() => removeSlot(slot.id)}
                      >
                        <Trash2 size={16} color={Colors.dark.error} />
                      </TouchableOpacity>
                    </View>
                  );
                });
              })()}

              <View style={styles.addSlotRow}>
                {[PositionEnum.GK, PositionEnum.DEF, PositionEnum.MID, PositionEnum.FWD, PositionEnum.ANY].filter(
                  role => !slots.some(s => s.role === role)
                ).map(
                  (role) => {
                    const iconConfig = POSITION_ICONS[role];
                    const color = Colors.positions[role];

                    return (
                      <TouchableOpacity
                        key={role}
                        style={[styles.addSlotButton, { borderColor: color }]}
                        onPress={() => addSlot(role)}
                      >
                        {iconConfig.type === 'lucide' ? (
                          <iconConfig.name size={14} color={color} />
                        ) : (
                          <MaterialCommunityIcons name={iconConfig.name} size={14} color={color} />
                        )}
                        <Text style={[styles.addSlotText, { color }]}>
                          {POSITION_ABBR[role]}
                        </Text>
                      </TouchableOpacity>
                    );
                  }
                )}
              </View>
            </View>
          </>
        }
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps='handled'
      />

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.createButton, isLoading && styles.createButtonDisabled]}
          onPress={handleCreate}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={Colors.dark.background} />
          ) : (
            <>
              <Text style={styles.createButtonText}>
                {editId ? 'Guardar Cambios' : 'Crear Partido'}
              </Text>
              <CheckCircle2 size={20} color={Colors.dark.background} />
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
      >
        <View style={styles.successOverlay}>
          <View style={styles.successCard}>
            <View style={styles.successIcon}>
              <CheckCircle2 size={48} color={Colors.dark.primary} />
            </View>
            <Text style={styles.successTitle}>¡Partido Creado!</Text>
            <Text style={styles.successSubtitle}>
              Tu partido ya está disponible para otros jugadores. ¡A jugar!
            </Text>
            <TouchableOpacity
              style={styles.successButton}
              onPress={() => {
                setShowSuccessModal(false);
                router.push('/(tabs)');
              }}
            >
              <Text style={styles.successButtonText}>Genial</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.dark.text,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.dark.textSecondary,
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark.textSecondary,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  horizontalScroll: {
    paddingRight: 20,
    gap: 10,
  },
  ageChip: {
    backgroundColor: Colors.dark.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  ageChipSelected: {
    backgroundColor: Colors.dark.primary,
    borderColor: Colors.dark.primary,
  },
  ageChipText: {
    color: Colors.dark.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  ageChipTextSelected: {
    color: Colors.dark.background,
    fontWeight: '700',
  },
  eliteChipOutline: {
    borderColor: Colors.dark.accent + '80',
    borderWidth: 1.5,
  },
  chipContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.dark.text,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  surfaceScrollContent: {
    gap: 10,
    paddingRight: 20,
  },
  surfaceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    gap: 8,
  },
  surfaceChipActive: {
    borderColor: Colors.dark.primary,
    backgroundColor: Colors.dark.primaryGlow,
  },
  surfaceChipText: {
    color: Colors.dark.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  surfaceChipTextActive: {
    color: Colors.dark.primary,
  },
  inputWithIcon: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  inputFlex: {
    flex: 1,
    fontSize: 16,
    color: Colors.dark.text,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.dark.primary,
  },
  formatChipsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  formatChip: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: Colors.dark.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  formatChipActive: {
    backgroundColor: Colors.dark.primaryGlow,
    borderColor: Colors.dark.primary,
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  formatChipText: {
    color: Colors.dark.textSecondary,
    fontSize: 18,
    fontWeight: '800',
  },
  formatChipTextActive: {
    color: Colors.dark.primary,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  typeWrapper: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  typeButton: {
    width: '100%',
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  typeDesc: {
    fontSize: 10,
    color: '#9E9E9E', // Gris claro reforzado
    textAlign: 'center',
    marginTop: 2,
  },
  typeButtonActive: {
    backgroundColor: Colors.dark.accent,
    borderColor: Colors.dark.accent,
  },
  typeButtonActivePro: {
    backgroundColor: Colors.dark.primary,
    borderColor: Colors.dark.primary,
  },
  typeButtonText: {
    color: Colors.dark.text,
    fontSize: 14,
    fontWeight: '600',
  },
  typeButtonTextActive: {
    color: Colors.dark.background,
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  dateButton: {
    flex: 2,
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  dateButtonText: {
    color: Colors.dark.text,
    fontSize: 14,
  },
  timeButton: {
    flex: 1,
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  timeButtonText: {
    color: Colors.dark.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  organizerPosRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  posChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.dark.surface,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  posChipText: {
    color: Colors.dark.textSecondary,
    fontSize: 14,
    fontWeight: '700',
  },
  slotsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  playerCountBadge: {
    backgroundColor: Colors.dark.surface,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  playerCountBadgeCorrect: {
    backgroundColor: Colors.dark.primaryGlow,
  },
  playerCountText: {
    color: Colors.dark.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  playerCountTextCorrect: {
    color: Colors.dark.primary,
  },
  slotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    gap: 12,
  },
  slotIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotName: {
    flex: 1,
    color: Colors.dark.text,
    fontSize: 15,
    fontWeight: '500',
  },
  slotControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  slotControlButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.dark.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotQuantity: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: '700',
    width: 40,
    textAlign: 'center',
  },
  slotRowOrganizer: {
    borderColor: Colors.dark.primary + '30',
    backgroundColor: Colors.dark.primary + '05',
    borderWidth: 1,
  },
  organizerMiniCrown: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.dark.surface,
    padding: 1,
    borderRadius: 4,
  },
  slotInfoContainer: {
    flex: 1,
  },
  organizerInSlotText: {
    fontSize: 10,
    color: Colors.dark.primary,
    fontWeight: '700',
    marginTop: -2,
  },
  slotDeleteButton: {
    padding: 8,
  },
  addSlotRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  addSlotButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  addSlotText: {
    fontSize: 12,
    fontWeight: '600',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20, // Padding extra para iOS Safe Area
    backgroundColor: Colors.dark.background,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
    zIndex: 10,
  },
  createButton: {
    backgroundColor: Colors.dark.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
    color: Colors.dark.background,
    fontSize: 18,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalDismiss: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: Colors.dark.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  modalTitle: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: '600',
  },
  modalDone: {
    color: Colors.dark.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  locationList: {
    marginTop: 8,
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    overflow: 'hidden',
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  locationItemText: {
    color: Colors.dark.text,
    fontSize: 14,
  },
  // Google Places styles
  googleInput: {
    backgroundColor: Colors.dark.surface,
    color: Colors.dark.text,
    fontSize: 16,
    paddingLeft: 44,
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  googleIconContainer: {
    position: 'absolute',
    left: 14,
    top: 18,
    zIndex: 1,
  },
  googleListView: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    overflow: 'hidden',
  },
  googleRow: {
    backgroundColor: Colors.dark.surface,
    padding: 14,
    height: 'auto',
  },
  googleText: {
    color: Colors.dark.text,
    fontSize: 14,
  },
  googleSeparator: {
    height: 1,
    backgroundColor: Colors.dark.border,
  },
  // Success Modal Styles
  successOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  successCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 24,
    padding: 30,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.dark.primaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.dark.text,
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 15,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  successButton: {
    backgroundColor: Colors.dark.primary,
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 12,
  },
  successButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
  },
});
