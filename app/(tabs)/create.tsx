import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
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
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useAppStore } from '@/store/useAppStore';
import { mockApi } from '@/services/mockApi';
import {
  FormatEnum,
  MatchTypeEnum,
  PositionEnum,
  FORMAT_LABELS,
  FORMAT_PLAYERS,
  MATCH_TYPE_LABELS,
  POSITION_LABELS,
  MatchSlot,
} from '@/types';

interface SlotInput {
  id: string;
  role: PositionEnum;
  quantity: number;
}

export default function CreateMatchScreen() {
  const router = useRouter();
  const { user } = useAppStore();

  const [title, setTitle] = useState('');
  const [format, setFormat] = useState<FormatEnum>(FormatEnum.F5);
  const [matchType, setMatchType] = useState<MatchTypeEnum>(MatchTypeEnum.CHILL);
  const [address, setAddress] = useState('');
  const [date, setDate] = useState(new Date(Date.now() + 24 * 60 * 60 * 1000));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [price, setPrice] = useState('5000');
  const [slots, setSlots] = useState<SlotInput[]>([
    { id: '1', role: PositionEnum.GK, quantity: 2 },
    { id: '2', role: PositionEnum.ANY, quantity: 8 },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const totalPlayers = slots.reduce((acc, s) => acc + s.quantity, 0);
  const suggestedPlayers = FORMAT_PLAYERS[format];

  const addSlot = (role: PositionEnum) => {
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
    setShowDatePicker(false);
    if (selectedDate) {
      const newDate = new Date(date);
      newDate.setFullYear(selectedDate.getFullYear());
      newDate.setMonth(selectedDate.getMonth());
      newDate.setDate(selectedDate.getDate());
      setDate(newDate);
    }
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
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
      const matchSlots: MatchSlot[] = slots.map((s) => ({
        id: s.id,
        role: s.role,
        quantity_needed: s.quantity,
        filled_by: [],
      }));

      await mockApi.createMatch({
        title: title.trim(),
        format,
        location: {
          latitude: -34.6037 + (Math.random() - 0.5) * 0.05,
          longitude: -58.3816 + (Math.random() - 0.5) * 0.05,
          address: address.trim(),
        },
        date,
        type: matchType,
        slots: matchSlots,
        organizer_id: user?.id || '',
        price: parseInt(price) || 0,
      });

      Alert.alert('¡Listo!', 'Tu partido fue creado', [
        { text: 'Ver partidos', onPress: () => router.push('/(tabs)') },
      ]);
    } catch (error) {
      console.error('Error creating match:', error);
      Alert.alert('Error', 'No se pudo crear el partido');
    } finally {
      setIsLoading(false);
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
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Crear Partido</Text>
          <Text style={styles.subtitle}>Organizá tu próximo picado</Text>
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
          <View style={styles.formatRow}>
            {Object.values(FormatEnum).map((f) => (
              <TouchableOpacity
                key={f}
                style={[styles.formatButton, format === f && styles.formatButtonActive]}
                onPress={() => setFormat(f)}
              >
                <Text
                  style={[
                    styles.formatButtonText,
                    format === f && styles.formatButtonTextActive,
                  ]}
                >
                  {FORMAT_LABELS[f]}
                </Text>
                <Text style={[styles.formatPlayers, format === f && styles.formatPlayersActive]}>
                  {FORMAT_PLAYERS[f]} jug.
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tipo de Partido</Text>
          <View style={styles.typeRow}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                matchType === MatchTypeEnum.CHILL && styles.typeButtonActive,
              ]}
              onPress={() => setMatchType(MatchTypeEnum.CHILL)}
            >
              <Heart
                size={20}
                color={
                  matchType === MatchTypeEnum.CHILL
                    ? Colors.dark.background
                    : Colors.dark.textSecondary
                }
              />
              <Text
                style={[
                  styles.typeButtonText,
                  matchType === MatchTypeEnum.CHILL && styles.typeButtonTextActive,
                ]}
              >
                {MATCH_TYPE_LABELS[MatchTypeEnum.CHILL]}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeButton,
                matchType === MatchTypeEnum.COMPETITIVE && styles.typeButtonActive,
              ]}
              onPress={() => setMatchType(MatchTypeEnum.COMPETITIVE)}
            >
              <Swords
                size={20}
                color={
                  matchType === MatchTypeEnum.COMPETITIVE
                    ? Colors.dark.background
                    : Colors.dark.textSecondary
                }
              />
              <Text
                style={[
                  styles.typeButtonText,
                  matchType === MatchTypeEnum.COMPETITIVE && styles.typeButtonTextActive,
                ]}
              >
                {MATCH_TYPE_LABELS[MatchTypeEnum.COMPETITIVE]}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ubicación</Text>
          <View style={styles.inputWithIcon}>
            <MapPin size={20} color={Colors.dark.textSecondary} />
            <TextInput
              style={styles.inputFlex}
              placeholder="Dirección de la cancha"
              placeholderTextColor={Colors.dark.textMuted}
              value={address}
              onChangeText={setAddress}
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

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onDateChange}
              minimumDate={new Date()}
              themeVariant="dark"
            />
          )}
          {showTimePicker && (
            <DateTimePicker
              value={date}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onTimeChange}
              themeVariant="dark"
            />
          )}
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
                {totalPlayers}/{suggestedPlayers}
              </Text>
            </View>
          </View>

          {slots.map((slot) => (
            <View key={slot.id} style={styles.slotRow}>
              <View style={[styles.slotIcon, { backgroundColor: Colors.positions[slot.role] + '20' }]}>
                {slot.role === PositionEnum.GK ? (
                  <Shield size={18} color={Colors.positions[slot.role]} />
                ) : (
                  <Users size={18} color={Colors.positions[slot.role]} />
                )}
              </View>
              <Text style={styles.slotName}>{POSITION_LABELS[slot.role]}</Text>
              
              <View style={styles.slotControls}>
                <TouchableOpacity
                  style={styles.slotControlButton}
                  onPress={() => updateSlotQuantity(slot.id, -1)}
                >
                  <Minus size={16} color={Colors.dark.text} />
                </TouchableOpacity>
                <Text style={styles.slotQuantity}>{slot.quantity}</Text>
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
          ))}

          <View style={styles.addSlotRow}>
            {[PositionEnum.GK, PositionEnum.DEF, PositionEnum.MID, PositionEnum.FWD, PositionEnum.ANY].map(
              (role) => (
                <TouchableOpacity
                  key={role}
                  style={[styles.addSlotButton, { borderColor: Colors.positions[role] }]}
                  onPress={() => addSlot(role)}
                >
                  <Plus size={14} color={Colors.positions[role]} />
                  <Text style={[styles.addSlotText, { color: Colors.positions[role] }]}>
                    {role === PositionEnum.ANY ? 'Cualquiera' : role}
                  </Text>
                </TouchableOpacity>
              )
            )}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.createButton, isLoading && styles.createButtonDisabled]}
          onPress={handleCreate}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          <Check size={20} color={Colors.dark.background} />
          <Text style={styles.createButtonText}>
            {isLoading ? 'Creando...' : 'Crear Partido'}
          </Text>
        </TouchableOpacity>
      </View>
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
  input: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.dark.text,
    borderWidth: 1,
    borderColor: Colors.dark.border,
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
  formatRow: {
    flexDirection: 'row',
    gap: 10,
  },
  formatButton: {
    flex: 1,
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  formatButtonActive: {
    backgroundColor: Colors.dark.primary,
    borderColor: Colors.dark.primary,
  },
  formatButtonText: {
    color: Colors.dark.text,
    fontSize: 15,
    fontWeight: '700',
  },
  formatButtonTextActive: {
    color: Colors.dark.background,
  },
  formatPlayers: {
    color: Colors.dark.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  formatPlayersActive: {
    color: Colors.dark.background,
    opacity: 0.7,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  typeButton: {
    flex: 1,
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  typeButtonActive: {
    backgroundColor: Colors.dark.accent,
    borderColor: Colors.dark.accent,
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
    fontSize: 18,
    fontWeight: '700',
    width: 24,
    textAlign: 'center',
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
    padding: 20,
    backgroundColor: Colors.dark.background,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
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
});
