import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    Easing,
    interpolate
} from 'react-native-reanimated';
import Colors from '@/constants/colors';
import { StatsRadar } from '@/types';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;
const ASPECT_RATIO = 2 / 2.8; // Compact aspect ratio
const CARD_HEIGHT = CARD_WIDTH / ASPECT_RATIO;

interface PlayerCardProps {
    nickname: string;
    avatar?: any;
    stats: StatsRadar;
    mainPosition: string;
    specificRole?: string;
    overall: number;
}

const STAT_LABELS: Record<keyof StatsRadar, string> = {
    pace: 'RIT',
    shooting: 'TIR',
    passing: 'PAS',
    defense: 'DEF',
    physical: 'FIS',
    stamina: 'AGU',
};

const getPersonalityMessage = (overall: number) => {
    if (overall >= 9.0) return "¡NIVEL SELECCIÓN!";
    if (overall >= 7.0) return "JUGADOR DE PRIMERA";
    if (overall >= 5.0) return "CRACK DE BARRIO";
    return "PROMESA";
};

export default function PlayerCard({
    nickname,
    avatar,
    stats,
    mainPosition,
    specificRole,
    overall
}: PlayerCardProps) {
    const shineX = useSharedValue(-CARD_WIDTH * 1.5);

    useEffect(() => {
        shineX.value = withRepeat(
            withTiming(CARD_WIDTH * 1.5, { duration: 3000, easing: Easing.bezier(0.4, 0, 0.2, 1) }),
            -1,
            false
        );
    }, []);

    const shineStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: shineX.value }, { skewX: '-20deg' }],
    }));

    const statsEntries = Object.entries(stats) as [keyof StatsRadar, number][];
    const leftStats = statsEntries.slice(0, 3);
    const rightStats = statsEntries.slice(3, 6);

    return (
        <View style={styles.outerContainer}>
            <Text style={styles.confirmTitle}>¡FICHAJE CONFIRMADO!</Text>

            <MotiView
                from={{ opacity: 0, scale: 0.9, rotateY: '15deg' }}
                animate={{ opacity: 1, scale: 1, rotateY: '0deg' }}
                transition={{ type: 'spring', damping: 15 }}
                style={styles.cardContainer}
            >
                <LinearGradient
                    colors={['#1a1a24', '#0d0d12']}
                    style={styles.innerCard}
                >
                    {/* Shine effect ray */}
                    <Animated.View style={[styles.shineRay, shineStyle]} />

                    <View style={styles.cardHeader}>
                        <View style={styles.overallContainer}>
                            <Text style={styles.overallText}>{overall.toFixed(1)}</Text>
                            <Text style={styles.overallLabel}>MEDIA</Text>
                        </View>

                        <View style={styles.avatarWrapper}>
                            <LinearGradient
                                colors={['#6366f1', '#a855f7']}
                                style={styles.avatarBorder}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            />
                            <View style={styles.avatarInner}>
                                {avatar ? (
                                    <Image source={typeof avatar === 'string' ? { uri: avatar } : avatar} style={styles.avatar} />
                                ) : (
                                    <View style={styles.avatarPlaceholder} />
                                )}
                            </View>
                        </View>
                    </View>

                    <View style={styles.cardBody}>
                        <Text style={styles.nickname} numberOfLines={1}>{nickname}</Text>
                        <Text style={styles.position}>
                            {mainPosition} {specificRole ? `• ${specificRole}` : ''}
                        </Text>

                        <View style={styles.stickerContainer}>
                            <LinearGradient
                                colors={['#FFD700', '#FFA500']}
                                style={styles.stickerBackground}
                            />
                            <Text style={styles.stickerText}>{getPersonalityMessage(overall)}</Text>
                        </View>
                    </View>

                    <View style={styles.statsLayout}>
                        <View style={styles.statsColumn}>
                            {leftStats.map(([key, value]) => (
                                <View key={key} style={styles.statItem}>
                                    <Text style={styles.statLabel}>{STAT_LABELS[key]}</Text>
                                    <View style={styles.miniBarContainer}>
                                        <MotiView
                                            from={{ width: 0 }}
                                            animate={{ width: `${value * 10}%` }}
                                            transition={{ type: 'timing', duration: 1000 }}
                                            style={[styles.miniBarFill, { backgroundColor: Colors.dark.primary }]}
                                        />
                                    </View>
                                    <Text style={styles.statValue}>{value}</Text>
                                </View>
                            ))}
                        </View>
                        <View style={styles.statsColumn}>
                            {rightStats.map(([key, value]) => (
                                <View key={key} style={styles.statItem}>
                                    <Text style={styles.statLabel}>{STAT_LABELS[key]}</Text>
                                    <View style={styles.miniBarContainer}>
                                        <MotiView
                                            from={{ width: 0 }}
                                            animate={{ width: `${value * 10}%` }}
                                            transition={{ type: 'timing', duration: 1000 }}
                                            style={[styles.miniBarFill, { backgroundColor: '#a855f7' }]}
                                        />
                                    </View>
                                    <Text style={styles.statValue}>{value}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </LinearGradient>
            </MotiView>
        </View>
    );
}

const styles = StyleSheet.create({
    outerContainer: {
        alignItems: 'center',
        width: '100%',
    },
    confirmTitle: {
        fontSize: 24,
        fontWeight: '900',
        color: Colors.dark.primary,
        fontStyle: 'italic',
        letterSpacing: 1,
        marginBottom: 15,
        textShadowColor: Colors.dark.primary + '80',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 15,
        textAlign: 'center',
    },
    cardContainer: {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        borderRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 15 },
        shadowOpacity: 0.6,
        shadowRadius: 20,
        elevation: 25,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        overflow: 'hidden',
    },
    innerCard: {
        flex: 1,
        padding: 24,
        justifyContent: 'space-between',
    },
    shineRay: {
        position: 'absolute',
        width: 100,
        height: '200%',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        top: '-50%',
        left: 0,
        zIndex: 10,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    overallContainer: {
        alignItems: 'flex-start',
    },
    overallText: {
        fontSize: 64,
        fontWeight: '900',
        color: '#ffffff',
        lineHeight: 64,
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 4, height: 4 },
        textShadowRadius: 2,
    },
    overallLabel: {
        fontSize: 12,
        fontWeight: '900',
        color: Colors.dark.primary,
        letterSpacing: 2,
        marginTop: 4,
    },
    avatarWrapper: {
        width: 100,
        height: 100,
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarBorder: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 50,
        opacity: 0.6,
    },
    avatarInner: {
        width: 94,
        height: 94,
        borderRadius: 47,
        backgroundColor: '#1a1a24',
        overflow: 'hidden',
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    avatarPlaceholder: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    cardBody: {
        alignItems: 'center',
        marginVertical: 10,
    },
    nickname: {
        fontSize: 34,
        fontWeight: '900',
        color: '#ffffff',
        textTransform: 'uppercase',
        textAlign: 'center',
    },
    position: {
        fontSize: 15,
        fontWeight: '700',
        color: Colors.dark.textSecondary,
        letterSpacing: 1,
        marginTop: 4,
    },
    stickerContainer: {
        marginTop: 12,
        paddingHorizontal: 14,
        paddingVertical: 6,
        transform: [{ rotate: '-3deg' }],
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 3,
    },
    stickerBackground: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 4,
    },
    stickerText: {
        color: '#000',
        fontSize: 13,
        fontWeight: '900',
        textTransform: 'uppercase',
        fontStyle: 'italic',
    },
    statsLayout: {
        flexDirection: 'row',
        gap: 15,
    },
    statsColumn: {
        flex: 1,
        gap: 10,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statLabel: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '900',
        width: 25,
    },
    miniBarContainer: {
        flex: 1,
        height: 8,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 4,
        overflow: 'hidden',
    },
    miniBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    statValue: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '900',
        width: 15,
        textAlign: 'right',
    },
});
