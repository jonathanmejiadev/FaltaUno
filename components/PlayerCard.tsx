import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    Easing,
    withSpring,
    interpolate,
    Extrapolate
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import { StatsRadar } from '@/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.88;
const ASPECT_RATIO = 1 / 1.5; // Taller ratio for more content
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

const RARITY = {
    ELITE: {
        color: '#FFD700',
        label: 'NIVEL SELECCIÓN',
        glow: '#FFD700',
        titulo: '¡NIVEL SELECCIÓN!',
        sub: 'Un distinto.'
    },
    PRO: {
        color: '#A855F7',
        label: 'JUGADOR DE PRIMERA',
        glow: '#A855F7',
        titulo: 'JUGADOR DE PRIMERA',
        sub: 'Marcás la diferencia.'
    },
    AMATEUR: {
        color: '#00EAFF',
        label: 'CRACK DE BARRIO',
        glow: '#00EAFF',
        titulo: 'CRACK DE BARRIO',
        sub: 'Nunca decepciona.'
    },
    BASE: {
        color: '#E5E4E2',
        label: 'PROMESA',
        glow: '#E5E4E2',
        titulo: 'PROMESA',
        sub: '¡A meterle garra!'
    },
};

const getRarity = (overall: number) => {
    if (overall >= 9.0) return RARITY.ELITE;
    if (overall >= 7.5) return RARITY.PRO;
    if (overall >= 6.0) return RARITY.AMATEUR;
    return RARITY.BASE;
};

export default function PlayerCard({
    nickname,
    avatar,
    stats,
    mainPosition,
    specificRole,
    overall
}: PlayerCardProps) {
    const rarity = useMemo(() => getRarity(overall), [overall]);

    // Animation Values
    const shineX = useSharedValue(-CARD_WIDTH * 1.5);
    const rotateX = useSharedValue(0);
    const rotateY = useSharedValue(0);
    const scale = useSharedValue(1);
    const pulse = useSharedValue(1);

    useEffect(() => {
        shineX.value = withRepeat(
            withTiming(CARD_WIDTH * 1.5, { duration: 4000, easing: Easing.bezier(0.4, 0, 0.2, 1) }),
            -1,
            false
        );
        pulse.value = withRepeat(
            withTiming(1.15, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
            -1,
            true
        );
    }, []);

    const gesture = Gesture.Pan()
        .onBegin(() => {
            scale.value = withSpring(1.05);
        })
        .onUpdate((event) => {
            // Limit tilt to ~15 degrees
            rotateY.value = interpolate(event.translationX, [-CARD_WIDTH / 2, CARD_WIDTH / 2], [15, -15], Extrapolate.CLAMP);
            rotateX.value = interpolate(event.translationY, [-CARD_HEIGHT / 2, CARD_HEIGHT / 2], [-15, 15], Extrapolate.CLAMP);
        })
        .onEnd(() => {
            rotateX.value = withSpring(0);
            rotateY.value = withSpring(0);
            scale.value = withSpring(1);
        });

    const cardAnimatedStyle = useAnimatedStyle(() => ({
        transform: [
            { perspective: 1000 },
            { rotateX: `${rotateX.value}deg` },
            { rotateY: `${rotateY.value}deg` },
            { scale: scale.value }
        ],
    }));

    const shineStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: shineX.value }, { skewX: '-25deg' }],
    }));

    const overallPulseStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulse.value }],
    }));

    const statsEntries = Object.entries(stats) as [keyof StatsRadar, number][];

    return (
        <View style={styles.container}>
            <GestureDetector gesture={gesture}>
                <Animated.View style={[styles.cardWrapper, cardAnimatedStyle]}>
                    <View style={[styles.cardMain, {
                        borderColor: rarity.color,
                        shadowColor: rarity.glow,
                    }]}>
                        <LinearGradient
                            colors={['#1a1a24', '#0d0d12', '#050508']}
                            style={styles.cardGradient}
                        >
                            {/* Brushed Metal Texture Overlay */}
                            <View style={styles.metalTexture} />

                            {/* Glossy Effect */}
                            <Animated.View style={[styles.glossyOverlay, shineStyle]} />

                            {/* Card Content */}
                            <View style={styles.contentContainer}>
                                <View style={styles.topInfo}>
                                    <View style={styles.overallBox}>
                                        <Animated.Text style={[styles.overallValue, overallPulseStyle, {
                                            color: rarity.color,
                                            textShadowColor: rarity.glow,
                                            textShadowOffset: { width: 0, height: 0 },
                                            textShadowRadius: 20,
                                        }]}>
                                            {overall.toFixed(1)}
                                        </Animated.Text>
                                        <Text style={styles.overallLabel}>MEDIA</Text>
                                    </View>

                                    <View style={styles.positionBadge}>
                                        <Text style={styles.positionText}>{mainPosition}</Text>
                                    </View>
                                </View>

                                {/* AVATAR - HERALDIC SHIELD WITH NEON BORDER */}
                                <View style={styles.avatarContainer}>
                                    <View style={[styles.heraldShield, {
                                        borderColor: rarity.color,
                                        shadowColor: rarity.glow,
                                    }]}>
                                        <View style={styles.shieldInner}>
                                            {avatar ? (
                                                <Image
                                                    source={
                                                        (typeof avatar === 'string' && !isNaN(Number(avatar)))
                                                            ? Number(avatar)
                                                            : (typeof avatar === 'string' ? { uri: avatar } : avatar)
                                                    }
                                                    style={styles.playerAvatar}
                                                    contentFit="cover"
                                                />
                                            ) : (
                                                <View style={styles.avatarPlaceholder}>
                                                    <MaterialCommunityIcons name="account" size={70} color="#555" />
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                </View>

                                <View style={styles.playerInfo}>
                                    <Text style={styles.nickname} numberOfLines={1}>{nickname}</Text>
                                    <Text style={styles.roleText}>{specificRole?.toUpperCase() || 'JUGADOR'}</Text>

                                    {/* PERSONALITY BADGE - GOLDEN IMPACT */}
                                    <View style={styles.personalityBadge}>
                                        <LinearGradient
                                            colors={overall >= 9.0 ? ['#FFD700', '#FFA500'] : [rarity.color, `${rarity.color}CC`, `${rarity.color}99`]}
                                            style={styles.ribbonGradient}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 1 }}
                                        >
                                            <View style={styles.ribbonContent}>
                                                <Text style={styles.tituloText}>{rarity.titulo}</Text>
                                                <Text style={styles.subText}>{rarity.sub}</Text>
                                            </View>
                                        </LinearGradient>
                                        {/* Ribbon corners */}
                                        <View style={[styles.ribbonCorner, styles.ribbonCornerLeft, { borderRightColor: overall >= 9.0 ? '#FFD700' : rarity.color }]} />
                                        <View style={[styles.ribbonCorner, styles.ribbonCornerRight, { borderLeftColor: overall >= 9.0 ? '#FFD700' : rarity.color }]} />
                                    </View>
                                </View>

                                <View style={styles.statsGrid}>
                                    {statsEntries.map(([key, value]) => (
                                        <View key={key} style={styles.statBox}>
                                            <Text style={styles.statLabelText}>{STAT_LABELS[key]}</Text>
                                            <View style={styles.statLine}>
                                                <View style={styles.statBarBg}>
                                                    <MotiView
                                                        from={{ width: 0 }}
                                                        animate={{ width: `${value * 10}%` }}
                                                        transition={{ type: 'timing', duration: 1500, delay: 500 }}
                                                        style={[styles.statBarFill, { backgroundColor: getRarity(value).color }]}
                                                    />
                                                </View>
                                                <Text style={[styles.statValueText, { color: getRarity(value).color }]}>{value}</Text>
                                            </View>
                                        </View>
                                    ))}
                                </View>

                                {/* Metallic Seal */}
                                <View style={styles.sealArea}>
                                    <LinearGradient
                                        colors={['#d1d5db', '#9ca3af', '#4b5563']}
                                        style={styles.metallicSeal}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                    >
                                        <MaterialCommunityIcons name="seal-variant" size={14} color="#1a1a24" />
                                        <Text style={styles.sealText}>{rarity.label}</Text>
                                    </LinearGradient>
                                </View>
                            </View>
                        </LinearGradient>
                    </View>
                </Animated.View>
            </GestureDetector>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 20,
    },
    cardWrapper: {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
    },
    cardMain: {
        flex: 1,
        borderRadius: 0, // Remove for shield shape
        overflow: 'hidden',
        borderWidth: 3, // Thicker border
        borderColor: 'transparent', // Will be set dynamically
        // Shield shape using clip-path simulation
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 25 },
        shadowOpacity: 0.9,
        shadowRadius: 35,
        elevation: 25,
    },
    cardGradient: {
        flex: 1,
        // Carbon fiber texture simulation
        backgroundColor: '#0a0a0f',
    },
    metalTexture: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'transparent',
        opacity: 0.03,
        // Simulated brushed metal with repeating pattern
        borderWidth: 0.5,
        borderColor: 'rgba(255,255,255,0.02)',
    },
    glossyOverlay: {
        position: 'absolute',
        width: CARD_WIDTH * 0.4,
        height: '250%',
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        top: '-75%',
        left: 0,
        zIndex: 5,
    },
    contentContainer: {
        flex: 1,
        padding: 24,
        zIndex: 10,
        justifyContent: 'space-between',
    },
    avatarContainer: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 8, // Reduced spacing
        marginTop: -5,
    },
    heraldShield: {
        width: 140, // Smaller for more space
        height: 150,
        position: 'relative',
        borderWidth: 3,
        borderRadius: 12,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 15,
        elevation: 12,
    },
    shieldInner: {
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.5)',
        // Heraldic shield shape
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        borderBottomLeftRadius: 80,
        borderBottomRightRadius: 80,
        overflow: 'hidden', // Perfect framing
    },
    playerAvatar: {
        width: '100%',
        height: '100%',
    },
    avatarPlaceholder: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    topInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    overallBox: {
        alignItems: 'center',
    },
    overallValue: {
        fontSize: 56,
        fontWeight: '900',
    },
    overallLabel: {
        color: Colors.dark.textSecondary,
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 2,
        marginTop: -4,
    },
    positionBadge: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    positionText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '900',
    },
    playerInfo: {
        marginTop: 4, // Tighter spacing
        marginBottom: 8,
    },
    nickname: {
        color: '#fff',
        fontSize: 32, // Slightly smaller
        fontWeight: '900',
        textTransform: 'uppercase',
        textShadowColor: 'rgba(0,0,0,0.8)',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 4,
        textAlign: 'center',
        letterSpacing: 0.5,
    },
    roleText: {
        color: Colors.dark.primary,
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 2,
        marginTop: 1,
        textAlign: 'center',
    },
    personalityBadge: {
        marginTop: 10, // Reduced
        width: '100%',
        alignItems: 'center',
        position: 'relative',
    },
    ribbonGradient: {
        paddingHorizontal: 18,
        paddingVertical: 8, // Reduced
        minWidth: '85%',
        borderRadius: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
        elevation: 8,
    },
    ribbonContent: {
        alignItems: 'center',
    },
    tituloText: {
        fontSize: 13, // Slightly smaller
        fontWeight: '900',
        textAlign: 'center',
        letterSpacing: 1.2,
        textTransform: 'uppercase',
        color: '#fff', // White for better contrast
        textShadowColor: 'rgba(0,0,0,0.8)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    subText: {
        fontSize: 9, // Smaller
        fontWeight: '700',
        textAlign: 'center',
        color: '#fff', // White for better contrast
        marginTop: 1,
        opacity: 0.9,
    },
    ribbonCorner: {
        position: 'absolute',
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
    },
    ribbonCornerLeft: {
        left: 0,
        bottom: -8,
        borderTopWidth: 8,
        borderRightWidth: 12,
        borderBottomWidth: 0,
        borderLeftWidth: 0,
        borderTopColor: 'transparent',
        borderBottomColor: 'transparent',
        borderLeftColor: 'transparent',
    },
    ribbonCornerRight: {
        right: 0,
        bottom: -8,
        borderTopWidth: 8,
        borderRightWidth: 0,
        borderBottomWidth: 0,
        borderLeftWidth: 12,
        borderTopColor: 'transparent',
        borderBottomColor: 'transparent',
        borderRightColor: 'transparent',
    },
    statsGrid: {
        marginTop: 4, // Reduced
        gap: 5, // Tighter
    },
    statBox: {
        width: '100%',
    },
    statLabelText: {
        color: '#888',
        fontSize: 8, // Smaller
        fontWeight: '900',
        marginBottom: 2,
        textTransform: 'uppercase',
    },
    statLine: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8, // Reduced
    },
    statBarBg: {
        flex: 1,
        height: 5, // Thinner
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 3,
        overflow: 'hidden',
    },
    statBarFill: {
        height: '100%',
        borderRadius: 3,
    },
    statValueText: {
        fontSize: 14, // Slightly smaller
        fontWeight: '900',
        width: 22,
        textAlign: 'right',
        textShadowColor: 'rgba(0,0,0,0.8)',
        textShadowOffset: { width: 1, height: 2 },
        textShadowRadius: 3,
    },
    sealArea: {
        alignItems: 'center',
        marginTop: 12,
    },
    metallicSeal: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    sealText: {
        color: '#1a1a24',
        fontSize: 10,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
});
