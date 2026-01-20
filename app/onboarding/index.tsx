import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight, Gamepad2, Calendar } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Colors from '@/constants/colors';
import AvatarSelector from '@/components/AvatarSelector';
import { calculateCategory } from '@/services/mockApi';

const AVATARS = [
  require('../../assets/images/avatars/sc0.png'),
  require('../../assets/images/avatars/sc1.png'),
  require('../../assets/images/avatars/sc2.png'),
  require('../../assets/images/avatars/sc3.png'),
  require('../../assets/images/avatars/sc4.png'),
  require('../../assets/images/avatars/sc5.png'),
];

export default function OnboardingIdentity() {
  const router = useRouter();
  const [nickname, setNickname] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [category, setCategory] = useState('');

  useEffect(() => {
    if (birthDate) {
      const cat = calculateCategory(birthDate);
      setCategory(cat);
    }
  }, [birthDate]);

  const handleNext = () => {
    if (!nickname.trim()) {
      return;
    }

    router.push({
      pathname: '/onboarding/position',
      params: {
        nickname: nickname.trim(),
        avatar: selectedAvatar,
        birthDate: birthDate?.toISOString() || '',
      },
    });
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }

    if (selectedDate) {
      setBirthDate(selectedDate);
    }
  };

  const confirmDate = () => {
    if (!birthDate) setBirthDate(new Date(2000, 0, 1));
    setShowDatePicker(false);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const isValid = nickname.trim().length >= 3;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons name="soccer" size={48} color={Colors.dark.primary} />
            </View>
            <Text style={styles.title}>¡Armá tu Ficha de Crack!</Text>
            <Text style={styles.subtitle}>
              Cargá tus stats y demostrá qué sabés hacer en la cancha.
            </Text>
          </View>

          <View style={styles.stepIndicator}>
            <View style={[styles.step, styles.stepActive]} />
            <View style={styles.step} />
            <View style={styles.step} />
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tu Apodo</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: ElPibe10, Muralla, etc."
                placeholderTextColor={Colors.dark.textMuted}
                value={nickname}
                onChangeText={setNickname}
                maxLength={20}
                autoCapitalize="none"
              />
              <Text style={styles.hint}>
                {nickname.length}/20 caracteres
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Elige tu Avatar</Text>
              <AvatarSelector
                avatars={AVATARS}
                selectedAvatar={selectedAvatar}
                onSelectAvatar={setSelectedAvatar}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Fecha de Nacimiento</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Calendar size={20} color={Colors.dark.textSecondary} />
                <Text style={[styles.dateText, !birthDate && styles.datePlaceholder]}>
                  {birthDate ? formatDate(birthDate) : 'Seleccionar fecha'}
                </Text>
              </TouchableOpacity>

              {category && (
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>
                    Sos Categoría <Text style={styles.categoryHighlight}>{category}</Text>
                  </Text>
                </View>
              )}
            </View>

            {Platform.OS === 'ios' ? (
              <Modal
                visible={showDatePicker}
                transparent={true}
                animationType="slide"
              >
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                      <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                        <Text style={styles.modalCancelText}>Cancelar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={confirmDate}>
                        <Text style={styles.modalDoneText}>Listo</Text>
                      </TouchableOpacity>
                    </View>
                    <DateTimePicker
                      value={birthDate || new Date(2000, 0, 1)}
                      mode="date"
                      display="spinner"
                      onChange={onDateChange}
                      maximumDate={new Date()}
                      minimumDate={new Date(1950, 0, 1)}
                      themeVariant="dark"
                    />
                  </View>
                </View>
              </Modal>
            ) : (
              showDatePicker && (
                <DateTimePicker
                  value={birthDate || new Date(2000, 0, 1)}
                  mode="date"
                  display="default"
                  onChange={onDateChange}
                  maximumDate={new Date()}
                  minimumDate={new Date(1950, 0, 1)}
                />
              )
            )}
          </View>
        </ScrollView>

        <TouchableOpacity
          style={[styles.nextButton, !isValid && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={!isValid}
          activeOpacity={0.8}
        >
          <Text style={styles.nextButtonText}>Siguiente</Text>
          <ChevronRight size={24} color={Colors.dark.background} />
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.dark.primaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    // Efecto de resplandor neón
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.dark.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 32,
  },
  step: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.dark.border,
  },
  stepActive: {
    backgroundColor: Colors.dark.primary,
  },
  form: {
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 4,
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
  hint: {
    fontSize: 12,
    color: Colors.dark.textMuted,
    textAlign: 'right',
  },
  dateButton: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  dateText: {
    fontSize: 16,
    color: Colors.dark.text,
  },
  datePlaceholder: {
    color: Colors.dark.textMuted,
  },
  categoryBadge: {
    backgroundColor: Colors.dark.primaryGlow,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  categoryText: {
    color: Colors.dark.text,
    fontSize: 14,
    textAlign: 'center',
  },
  categoryHighlight: {
    color: Colors.dark.primary,
    fontWeight: '700',
  },
  nextButton: {
    backgroundColor: Colors.dark.primary,
    margin: 24,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  nextButtonDisabled: {
    backgroundColor: Colors.dark.border,
    opacity: 0.5,
  },
  nextButtonText: {
    color: Colors.dark.background,
    fontSize: 18,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: Colors.dark.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  modalCancelText: {
    color: Colors.dark.textMuted,
    fontSize: 16,
  },
  modalDoneText: {
    color: Colors.dark.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});
