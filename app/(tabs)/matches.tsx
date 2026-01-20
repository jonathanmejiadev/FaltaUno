import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    Calendar as CalendarIcon,
    MapPin,
    Users,
    ChevronRight,
    ShieldCheck,
    Clock,
    Heart,
    Zap,
    Swords
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useAppStore } from '@/store/useAppStore';
import { mockApi, getTotalSlots } from '@/services/mockApi';
import { Match, MatchTypeEnum, MATCH_TYPE_LABELS } from '@/types';

type TabType = 'upcoming' | 'finished';

export default function MyMatchesScreen() {
    const router = useRouter();
    const { user, matches, isLoading: storeLoading } = useAppStore();
    const [activeTab, setActiveTab] = useState<TabType>('upcoming');

    const organizerMatches = matches.filter(m => m.organizer_id === user?.id);

    const filteredMatches = organizerMatches.filter(m => {
        const isFinished = new Date(m.date) < new Date();
        return activeTab === 'upcoming' ? !isFinished : isFinished;
    });

    const renderMatchCard = ({ item: match }: { item: Match }) => {
        const { filled, total } = getTotalSlots(match);
        const isOrganizer = match.organizer_id === user?.id;

        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={styles.typeTag}>
                        {match.type === MatchTypeEnum.CHILL ? (
                            <Heart size={14} color="#FFD600" />
                        ) : match.type === MatchTypeEnum.PRO ? (
                            <Zap size={14} color="#FF3D00" />
                        ) : (
                            <Swords size={14} color="#FF9100" />
                        )}
                        <Text style={[
                            styles.typeText,
                            match.type === MatchTypeEnum.CHILL && { color: '#FFD600' },
                            match.type === MatchTypeEnum.COMPETITIVE && { color: '#FF9100' },
                            match.type === MatchTypeEnum.PRO && { color: '#FF3D00' },
                        ]}>
                            {MATCH_TYPE_LABELS[match.type]}
                        </Text>
                    </View>

                    {isOrganizer && (
                        <View style={styles.organizerBadge}>
                            <ShieldCheck size={12} color={Colors.dark.primary} />
                            <Text style={styles.organizerText}>Organizador</Text>
                        </View>
                    )}
                </View>

                <Text style={styles.title}>{match.title}</Text>

                <View style={styles.infoRow}>
                    <View style={styles.infoItem}>
                        <CalendarIcon size={14} color={Colors.dark.textMuted} />
                        <Text style={styles.infoText}>
                            {new Date(match.date).toLocaleDateString('es-ES', {
                                weekday: 'short',
                                day: 'numeric',
                                month: 'short'
                            })}
                        </Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Clock size={14} color={Colors.dark.textMuted} />
                        <Text style={styles.infoText}>
                            {new Date(match.date).toLocaleTimeString('es-ES', {
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </Text>
                    </View>
                </View>

                <View style={styles.infoRow}>
                    <View style={styles.infoItem}>
                        <MapPin size={14} color={Colors.dark.textMuted} />
                        <Text style={styles.infoText} numberOfLines={1}>{match.location.address}</Text>
                    </View>
                </View>

                <View style={styles.footer}>
                    <View style={styles.slotsContainer}>
                        <Users size={14} color={Colors.dark.textMuted} />
                        <Text style={styles.slotsText}>{filled}/{total} jugadores</Text>
                    </View>

                    <TouchableOpacity
                        style={styles.manageButton}
                        onPress={() => router.push(`/match/manage/${match.id}`)}
                    >
                        <Text style={styles.manageButtonText}>Gestionar</Text>
                        <ChevronRight size={16} color={Colors.dark.background} />
                    </TouchableOpacity>
                </View>

                {match.requests && match.requests.length > 0 && (
                    <View style={styles.notificationBadge}>
                        <Text style={styles.notificationText}>{match.requests.length}</Text>
                    </View>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Mis Partidos</Text>
            </View>

            <View style={styles.tabBar}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
                    onPress={() => setActiveTab('upcoming')}
                >
                    <Text style={[styles.tabLabel, activeTab === 'upcoming' && styles.activeTabLabel]}>Próximos</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'finished' && styles.activeTab]}
                    onPress={() => setActiveTab('finished')}
                >
                    <Text style={[styles.tabLabel, activeTab === 'finished' && styles.activeTabLabel]}>Finalizados</Text>
                </TouchableOpacity>
            </View>

            {storeLoading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={Colors.dark.primary} />
                </View>
            ) : (
                <FlatList
                    data={filteredMatches}
                    renderItem={renderMatchCard}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <CalendarIcon size={48} color={Colors.dark.border} />
                            <Text style={styles.emptyText}>
                                No tienes partidos {activeTab === 'upcoming' ? 'próximos' : 'finalizados'}
                            </Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.dark.background,
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: Colors.dark.text,
    },
    tabBar: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginBottom: 20,
        gap: 10,
    },
    tab: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: Colors.dark.surface,
        borderWidth: 1,
        borderColor: Colors.dark.border,
    },
    activeTab: {
        backgroundColor: Colors.dark.primary + '20',
        borderColor: Colors.dark.primary,
    },
    tabLabel: {
        color: Colors.dark.textMuted,
        fontWeight: '600',
        fontSize: 14,
    },
    activeTabLabel: {
        color: Colors.dark.primary,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    card: {
        backgroundColor: Colors.dark.surface,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: Colors.dark.border,
        position: 'relative',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    typeTag: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    typeText: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    organizerBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: Colors.dark.primary + '15',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    organizerText: {
        color: Colors.dark.primary,
        fontSize: 10,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.dark.text,
        marginBottom: 12,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 15,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    infoText: {
        color: Colors.dark.textSecondary,
        fontSize: 13,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 15,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: Colors.dark.border,
    },
    slotsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    slotsText: {
        color: Colors.dark.textMuted,
        fontSize: 13,
        fontWeight: '600',
    },
    manageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: Colors.dark.primary,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    manageButtonText: {
        color: Colors.dark.background,
        fontSize: 14,
        fontWeight: '700',
    },
    notificationBadge: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: Colors.dark.error,
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: Colors.dark.background,
    },
    notificationText: {
        color: 'white',
        fontSize: 10,
        fontWeight: '800',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        marginTop: 100,
        alignItems: 'center',
        opacity: 0.5,
    },
    emptyText: {
        color: Colors.dark.textMuted,
        marginTop: 15,
        fontSize: 16,
        textAlign: 'center',
    },
});
