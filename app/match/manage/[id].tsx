import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Image,
    Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    ArrowLeft,
    Settings,
    Edit3,
    Check,
    X,
    UserPlus,
    Users,
    Clock,
    Shield,
    Star,
    Trash2
} from 'lucide-react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import { useAppStore } from '@/store/useAppStore';
import { mockApi, getTotalSlots, MOCK_USERS } from '@/services/mockApi';
import { Match, MatchRequest, PositionEnum, POSITION_LABELS } from '@/types';

export default function MatchManageScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { user, matches, respondToRequest, deleteMatch, isLoading: storeLoading } = useAppStore();
    const [match, setMatch] = useState<Match | null>(null);

    useEffect(() => {
        const found = matches.find(m => m.id === id);
        if (found) {
            setMatch(found);
        } else if (id && !storeLoading) {
            // Fallback for mock seeds
            mockApi.getMatchById(id).then(setMatch);
        }
    }, [id, matches, storeLoading]);

    const handleResponse = async (userId: string, status: 'ACCEPTED' | 'REJECTED') => {
        if (!match) return;
        try {
            await respondToRequest(match.id, userId, status);
            Alert.alert('Éxito', `Solicitud ${status === 'ACCEPTED' ? 'aceptada' : 'rechazada'}`);
        } catch (error) {
            console.error('Error responding to request:', error);
        }
    };

    const handleDelete = () => {
        if (!match) return;

        Alert.alert(
            'Eliminar Partido',
            '¿Estás seguro de que quieres eliminar este partido? Esta acción no se puede deshacer.',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteMatch(match.id);
                            router.replace('/(tabs)/matches');
                        } catch (error) {
                            Alert.alert('Error', 'No se pudo eliminar el partido');
                        }
                    }
                }
            ]
        );
    };

    if (storeLoading && !match) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={Colors.dark.primary} />
            </View>
        );
    }

    if (!match) return null;

    const { filled, total } = getTotalSlots(match);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color={Colors.dark.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Gestionar Partido</Text>
                <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => router.push({
                        pathname: '/(tabs)/create',
                        params: { editId: match.id }
                    })}
                >
                    <Edit3 size={20} color={Colors.dark.primary} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Resumen Card */}
                <View style={styles.summaryCard}>
                    <Text style={styles.matchTitle}>{match.title}</Text>
                    <View style={styles.summaryRow}>
                        <View style={styles.summaryItem}>
                            <Users size={16} color={Colors.dark.textMuted} />
                            <Text style={styles.summaryText}>{filled}/{total} Jugadores</Text>
                        </View>
                        <View style={styles.summaryItem}>
                            <Clock size={16} color={Colors.dark.textMuted} />
                            <Text style={styles.summaryText}>
                                {new Date(match.date).toLocaleDateString()}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Solicitudes Pendientes */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <UserPlus size={20} color={Colors.dark.primary} />
                        <Text style={styles.sectionTitle}>Solicitudes Pendientes</Text>
                        {match.requests && (
                            <View style={styles.countBadge}>
                                <Text style={styles.countText}>{match.requests.length}</Text>
                            </View>
                        )}
                    </View>

                    {match.requests && match.requests.length > 0 ? (
                        match.requests.map((req) => (
                            <View key={req.user.id} style={styles.requestItem}>
                                <Image source={
                                    (typeof req.user.avatar_url === 'string' && !isNaN(Number(req.user.avatar_url)))
                                        ? Number(req.user.avatar_url)
                                        : req.user.avatar_url
                                } style={styles.avatar} />
                                <View style={styles.userInfo}>
                                    <Text style={styles.userName}>{req.user.nickname}</Text>
                                    <View style={styles.mediaRow}>
                                        <Text style={styles.mediaLabel}>Media:</Text>
                                        <Text style={styles.mediaValue}>{req.user.media}</Text>
                                    </View>
                                </View>
                                <View style={styles.actionButtons}>
                                    <TouchableOpacity
                                        style={[styles.actionBtn, styles.acceptBtn]}
                                        onPress={() => handleResponse(req.user.id, 'ACCEPTED')}
                                    >
                                        <Check size={20} color={Colors.dark.background} />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.actionBtn, styles.rejectBtn]}
                                        onPress={() => handleResponse(req.user.id, 'REJECTED')}
                                    >
                                        <X size={20} color={Colors.dark.text} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.emptySectionText}>No hay solicitudes pendientes</Text>
                    )}
                </View>

                {/* Lista de Espera */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <MaterialCommunityIcons name="account-clock" size={20} color={Colors.dark.accent} />
                        <Text style={styles.sectionTitle}>Lista de Espera</Text>
                    </View>

                    {match.waitlist && match.waitlist.length > 0 ? (
                        match.waitlist.map((req) => (
                            <View key={req.user.id} style={styles.waitlistItem}>
                                <Image source={
                                    (typeof req.user.avatar_url === 'string' && !isNaN(Number(req.user.avatar_url)))
                                        ? Number(req.user.avatar_url)
                                        : req.user.avatar_url
                                } style={styles.avatarSmall} />
                                <View style={styles.waitlistInfo}>
                                    <Text style={styles.waitlistName}>{req.user.nickname}</Text>
                                    <View style={styles.mediaMiniRow}>
                                        <Text style={styles.mediaMiniLabel}>Media:</Text>
                                        <Text style={styles.mediaMiniValue}>{req.user.media}</Text>
                                    </View>
                                </View>
                                <Text style={styles.waitlistTime}>hace 10m</Text>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.emptySectionText}>Lista de espera vacía</Text>
                    )}
                </View>

                {/* Jugadores Confirmados */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Shield size={20} color={Colors.dark.success} />
                        <Text style={styles.sectionTitle}>Jugadores Confirmados</Text>
                    </View>
                    {match.slots.map((slot) => (
                        <View key={slot.id} style={styles.slotGroup}>
                            <View style={styles.slotHeader}>
                                <Text style={styles.slotTitle}>{POSITION_LABELS[slot.role]}</Text>
                                <Text style={styles.slotCount}>{slot.filled_by.length}/{slot.quantity_needed}</Text>
                            </View>
                            {(() => {
                                // Mapeamos los IDs a perfiles (usando MOCK_USERS de forma simplificada)
                                const usersInSlot = slot.filled_by.map(id => {
                                    if (id === user?.id) return user;
                                    return MOCK_USERS.find(u => u.id === id);
                                }).filter(Boolean);

                                return usersInSlot.map((p) => {
                                    if (!p) return null;
                                    const isOrganizer = p.id === match.organizer_id;
                                    return (
                                        <View key={p.id} style={styles.confirmedPlayer}>
                                            <View style={styles.playerMainInfo}>
                                                <Image source={
                                                    (typeof p.avatar_url === 'string' && !isNaN(Number(p.avatar_url)))
                                                        ? Number(p.avatar_url)
                                                        : p.avatar_url
                                                } style={styles.avatarMini} />
                                                <Text style={styles.confirmedPlayerName}>{p.nickname}</Text>
                                                {isOrganizer && (
                                                    <View style={styles.organizerBadgeTiny}>
                                                        <MaterialCommunityIcons name="crown" size={10} color="#FFD700" />
                                                    </View>
                                                )}
                                            </View>
                                            <TouchableOpacity style={styles.removePlayerBtn}>
                                                <X size={14} color={Colors.dark.error} />
                                            </TouchableOpacity>
                                        </View>
                                    );
                                });
                            })()}
                            {slot.filled_by.length === 0 && (
                                <Text style={styles.slotEmpty}>Sin jugadores confirmados</Text>
                            )}
                        </View>
                    ))}
                </View>

                {/* Botón Eliminar */}
                <TouchableOpacity
                    style={styles.deleteMatchButton}
                    onPress={handleDelete}
                >
                    <Trash2 size={20} color={Colors.dark.error} />
                    <Text style={styles.deleteMatchText}>Eliminar Partido</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.dark.background,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.dark.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.dark.surface,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: Colors.dark.text,
    },
    editButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.dark.surface,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.dark.primary + '30',
    },
    scrollContent: {
        padding: 20,
    },
    summaryCard: {
        backgroundColor: Colors.dark.surface,
        borderRadius: 16,
        padding: 20,
        marginBottom: 25,
        borderLeftWidth: 4,
        borderLeftColor: Colors.dark.primary,
    },
    matchTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: Colors.dark.text,
        marginBottom: 10,
    },
    summaryRow: {
        flexDirection: 'row',
        gap: 20,
    },
    summaryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    summaryText: {
        color: Colors.dark.textSecondary,
        fontSize: 14,
        fontWeight: '600',
    },
    section: {
        marginBottom: 30,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        gap: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.dark.text,
        flex: 1,
    },
    countBadge: {
        backgroundColor: Colors.dark.primary,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    countText: {
        color: Colors.dark.background,
        fontSize: 12,
        fontWeight: '800',
    },
    requestItem: {
        backgroundColor: Colors.dark.surface,
        borderRadius: 12,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        borderWidth: 1,
        borderColor: Colors.dark.border,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    userInfo: {
        flex: 1,
        marginLeft: 12,
    },
    userName: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.dark.text,
        marginBottom: 2,
    },
    mediaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    mediaLabel: {
        fontSize: 12,
        color: Colors.dark.textMuted,
    },
    mediaValue: {
        fontSize: 13,
        fontWeight: '800',
        color: Colors.dark.primary, // Neon Green
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    actionBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    acceptBtn: {
        backgroundColor: Colors.dark.primary,
    },
    rejectBtn: {
        backgroundColor: Colors.dark.surface,
        borderWidth: 1,
        borderColor: Colors.dark.border,
    },
    emptySectionText: {
        color: Colors.dark.textMuted,
        fontSize: 14,
        fontStyle: 'italic',
        paddingLeft: 5,
    },
    waitlistItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: Colors.dark.surface + '80',
        borderRadius: 8,
        marginBottom: 8,
    },
    avatarSmall: {
        width: 30,
        height: 30,
        borderRadius: 15,
    },
    waitlistInfo: {
        flex: 1,
        marginLeft: 10,
    },
    waitlistName: {
        color: Colors.dark.text,
        fontWeight: '600',
        fontSize: 14,
    },
    mediaMiniRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    mediaMiniLabel: {
        fontSize: 11,
        color: Colors.dark.textMuted,
        marginRight: 4,
    },
    mediaMiniValue: {
        fontSize: 12,
        fontWeight: '700',
        color: Colors.dark.primary,
    },
    waitlistTime: {
        fontSize: 12,
        color: Colors.dark.textMuted,
    },
    slotGroup: {
        marginBottom: 15,
    },
    slotHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
        paddingHorizontal: 4,
    },
    slotTitle: {
        color: Colors.dark.textSecondary,
        fontWeight: '700',
        fontSize: 14,
    },
    slotCount: {
        color: Colors.dark.textMuted,
        fontSize: 13,
    },
    confirmedPlayer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: Colors.dark.surface + '50',
        padding: 10,
        borderRadius: 8,
        marginBottom: 5,
    },
    playerMainInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatarMini: {
        width: 24,
        height: 24,
        borderRadius: 12,
        marginRight: 10,
    },
    confirmedPlayerName: {
        color: Colors.dark.text,
        fontSize: 14,
        fontWeight: '500',
        marginRight: 6,
    },
    organizerBadgeTiny: {
        backgroundColor: '#FFD70020',
        padding: 2,
        borderRadius: 4,
    },
    removePlayerBtn: {
        padding: 4,
    },
    slotEmpty: {
        fontSize: 12,
        color: Colors.dark.textMuted,
        opacity: 0.5,
        fontStyle: 'italic',
        paddingLeft: 10,
    },
    deleteMatchButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        marginHorizontal: 20,
        marginVertical: 30,
        backgroundColor: Colors.dark.error + '15',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.dark.error + '30',
        gap: 10,
    },
    deleteMatchText: {
        color: Colors.dark.error,
        fontSize: 16,
        fontWeight: '700',
    },
});
