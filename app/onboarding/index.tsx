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
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight, Gamepad2, Calendar } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Colors from '@/constants/colors';
import AvatarSelector from '@/components/AvatarSelector';
import { calculateCategory } from '@/services/mockApi';

const AVATARS = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1599566150163-29194dcabd36?w=200&h=200&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&h=200&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=200&h=200&fit=crop&crop=face',
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
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setBirthDate(selectedDate);
    }
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
              <Gamepad2 size={40} color={Colors.dark.primary} />
            </View>
            <Text style={styles.title}>Crea tu Jugador</Text>
            <Text style={styles.subtitle}>
              Dale vida a tu personaje en la cancha
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
                    ¡Eres categoría <Text style={styles.categoryHighlight}>{category}</Text>!
                  </Text>
                </View>
              )}
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={birthDate || new Date(2000, 0, 1)}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onDateChange}
                maximumDate={new Date()}
                minimumDate={new Date(1950, 0, 1)}
                themeVariant="dark"
              />
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
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.dark.primaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
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
});
