import React, { useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    withRepeat,
    Easing,
    interpolate,
    Extrapolate,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { StatsRadar } from '@/types';
import Colors from '@/constants/colors';
import Svg, { Path, Polygon, Line, Circle, Rect } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.88;
const ASPECT_RATIO = 1 / 1.35;
const CARD_HEIGHT = CARD_WIDTH / ASPECT_RATIO;

interface PlayerCardProps {
    nickname: string;
    avatar?: string | number | any;
    stats: StatsRadar;
    mainPosition: string;
    specificRole?: string;
    overall: number;
}

const RARITY = {
    ELITE: {
        color: '#FFD700',
        borderOuter: '#00D9FF',
        borderInner: '#A855F7',
        label: 'NIVEL SELECCIÓN',
        glow: '#FFD700',
        message: '¡Un distinto! Nivel selección.'
    },
    PRO: {
        color: '#A855F7',
        borderOuter: '#00D9FF',
        borderInner: '#A855F7',
        label: 'JUGADOR DE PRIMERA',
        glow: '#A855F7',
        message: 'Marcás la diferencia en la cancha.'
    },
    AMATEUR: {
        color: '#00EAFF',
        borderOuter: '#00D9FF',
        borderInner: '#A855F7',
        label: 'CRACK DE BARRIO',
        glow: '#00EAFF',
        message: 'El que nunca te deja a gamba.'
    },
    BASE: {
        color: '#E5E4E2',
        borderOuter: '#00D9FF',
        borderInner: '#A855F7',
        label: 'PROMESA',
        glow: '#E5E4E2',
        message: '¡A meterle garra y crecer!'
    },
};

const getRarity = (overall: number) => {
    if (overall >= 9.0) return RARITY.ELITE;
    if (overall >= 7.5) return RARITY.PRO;
    if (overall >= 6.0) return RARITY.AMATEUR;
    return RARITY.BASE;
};

const STAT_LABELS: Record<keyof StatsRadar, string> = {
    pace: 'RIT',
    shooting: 'TIR',
    passing: 'PAS',
    defense: 'DEF',
    physical: 'FÍS',
    stamina: 'RES',
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
            withTiming(1.08, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
            -1,
            true
        );
    }, []);

    const gesture = Gesture.Pan()
        .onBegin(() => {
            scale.value = withSpring(1.05);
        })
        .onUpdate((event) => {
            rotateY.value = interpolate(event.translationX, [-CARD_WIDTH / 2, CARD_WIDTH / 2], [12, -12], Extrapolate.CLAMP);
            rotateX.value = interpolate(event.translationY, [-CARD_HEIGHT / 2, CARD_HEIGHT / 2], [-12, 12], Extrapolate.CLAMP);
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
                    {/* Shield-shaped card with double border */}
                    <View style={styles.shieldContainer}>
                        {/* Outer border (Cyan) */}
                        <View style={[styles.borderOuter, { borderColor: rarity.borderOuter, shadowColor: rarity.borderOuter }]}>
                            {/* Inner border (Violet) */}
                            <View style={[styles.borderInner, { borderColor: rarity.borderInner }]}>
                                <LinearGradient
                                    colors={['#0a1628', '#16213e', '#0f1a2e']}
                                    style={styles.cardGradient}
                                >
                                    {/* Football Field Background */}
                                    <Svg style={styles.fieldSvg} viewBox="0 0 300 400">
                                        {/* Champions League Star */}
                                        <Polygon
                                            points="150,80 165,120 210,120 175,145 190,185 150,160 110,185 125,145 90,120 135,120"
                                            fill="rgba(0, 217, 255, 0.15)"
                                            stroke="rgba(0, 217, 255, 0.3)"
                                            strokeWidth="2"
                                        />

                                        {/* Field lines */}
                                        <Line x1="50" y1="200" x2="250" y2="200" stroke="rgba(0, 217, 255, 0.2)" strokeWidth="2" />
                                        <Line x1="50" y1="280" x2="250" y2="280" stroke="rgba(0, 217, 255, 0.2)" strokeWidth="2" />
                                        <Line x1="50" y1="320" x2="250" y2="320" stroke="rgba(0, 217, 255, 0.2)" strokeWidth="2" />

                                        {/* Center circle */}
                                        <Circle cx="150" cy="200" r="40" fill="none" stroke="rgba(0, 217, 255, 0.2)" strokeWidth="2" />

                                        {/* Goal area */}
                                        <Rect x="120" y="310" width="60" height="20" fill="none" stroke="rgba(0, 217, 255, 0.2)" strokeWidth="2" />

                                        {/* Diagonal lines for depth */}
                                        <Line x1="0" y1="150" x2="100" y2="250" stroke="rgba(0, 217, 255, 0.1)" strokeWidth="1" />
                                        <Line x1="300" y1="150" x2="200" y2="250" stroke="rgba(0, 217, 255, 0.1)" strokeWidth="1" />
                                    </Svg>

                                    {/* Glossy Effect */}
                                    <Animated.View style={[styles.glossyOverlay, shineStyle]} />

                                    {/* Card Content */}
                                    <View style={styles.contentContainer}>
                                        {/* Top Left: Overall + Position */}
                                        <View style={styles.topLeftCorner}>
                                            <Animated.Text style={[styles.overallLarge, overallPulseStyle, {
                                                color: '#fff',
                                                textShadowColor: rarity.glow,
                                                textShadowOffset: { width: 0, height: 0 },
                                                textShadowRadius: 25,
                                            }]}>
                                                {Math.round(overall * 10)}
                                            </Animated.Text>
                                            <Text style={styles.positionSmall}>{mainPosition}</Text>
                                        </View>

                                        {/* Center: Avatar (optional - can be removed for cleaner look) */}
                                        <View style={styles.avatarSection}>
                                            {avatar && (
                                                <View style={styles.avatarFrame}>
                                                    <Image
                                                        source={
                                                            (typeof avatar === 'string' && !isNaN(Number(avatar)))
                                                                ? Number(avatar)
                                                                : (typeof avatar === 'string' ? { uri: avatar } : avatar)
                                                        }
                                                        style={styles.avatarImage}
                                                        contentFit="cover"
                                                    />
                                                </View>
                                            )}
                                        </View>

                                        {/* Player Name */}
                                        <Text style={styles.playerName} numberOfLines={1}>{nickname}</Text>

                                        {/* Dynamic Description */}
                                        <Text style={styles.dynamicMessage} numberOfLines={2}>
                                            {rarity.message}
                                        </Text>

                                        {/* Stats Row - Single Line (6 stats) */}
                                        <View style={styles.statsRow}>
                                            {statsEntries.map(([key, value], index) => {
                                                const statColor = value >= 8 ? rarity.color : '#fff';
                                                return (
                                                    <MotiView
                                                        key={key}
                                                        from={{ opacity: 0, translateY: 20 }}
                                                        animate={{ opacity: 1, translateY: 0 }}
                                                        transition={{ delay: 400 + (index * 80), type: 'spring' }}
                                                        style={styles.statColumn}
                                                    >
                                                        <Text style={styles.statLabel}>
                                                            {STAT_LABELS[key]}
                                                        </Text>
                                                        <Text style={[styles.statValue, { color: statColor }]}>
                                                            {Math.round(value * 10)}
                                                        </Text>
                                                    </MotiView>
                                                );
                                            })}
                                        </View>

                                        {/* Bottom: FUT CARDS Logo */}
                                        <View style={styles.logoSection}>
                                            <Text style={styles.logoText}>FALTA UNO</Text>
                                            <Text style={styles.logoSubtext}>CARDS</Text>
                                        </View>
                                    </View>
                                </LinearGradient>
                            </View>
                        </View>
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
    shieldContainer: {
        flex: 1,
    },
    borderOuter: {
        flex: 1,
        borderWidth: 5,
        borderRadius: 28,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 20,
        elevation: 20,
        padding: 3,
    },
    borderInner: {
        flex: 1,
        borderWidth: 4,
        borderRadius: 24,
        overflow: 'hidden',
    },
    cardGradient: {
        flex: 1,
    },
    fieldSvg: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        opacity: 1,
    },
    glossyOverlay: {
        position: 'absolute',
        width: CARD_WIDTH * 0.5,
        height: CARD_HEIGHT * 2.5,
        backgroundColor: 'rgba(255,255,255,0.08)',
        top: -CARD_HEIGHT * 0.5,
    },
    contentContainer: {
        flex: 1,
        padding: 20,
        paddingTop: 25,
        paddingBottom: 15,
    },
    topLeftCorner: {
        position: 'absolute',
        top: 20,
        left: 20,
        alignItems: 'center',
        zIndex: 10,
    },
    overallLarge: {
        fontSize: 68,
        fontWeight: '900',
        lineHeight: 68,
    },
    positionSmall: {
        fontSize: 16,
        fontWeight: '900',
        color: '#fff',
        marginTop: 2,
        letterSpacing: 1.5,
    },
    avatarSection: {
        alignItems: 'center',
        marginTop: 100,
        marginBottom: 10,
        height: 80,
    },
    avatarFrame: {
        width: 80,
        height: 80,
        borderRadius: 40,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    playerName: {
        fontSize: 36,
        fontWeight: '900',
        color: '#fff',
        textAlign: 'center',
        textTransform: 'uppercase',
        textShadowColor: 'rgba(0,0,0,0.9)',
        textShadowOffset: { width: 0, height: 3 },
        textShadowRadius: 6,
        marginBottom: 8,
        letterSpacing: 2,
    },
    dynamicMessage: {
        fontSize: 13,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.85)',
        textAlign: 'center',
        marginBottom: 20,
        paddingHorizontal: 20,
        fontStyle: 'italic',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 10,
        marginBottom: 15,
    },
    statColumn: {
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 11,
        fontWeight: '900',
        color: '#fff',
        marginBottom: 4,
        letterSpacing: 0.5,
    },
    statValue: {
        fontSize: 28,
        fontWeight: '900',
        textShadowColor: 'rgba(0,0,0,0.9)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 5,
    },
    logoSection: {
        alignItems: 'center',
        marginTop: 'auto',
    },
    logoText: {
        fontSize: 16,
        fontWeight: '900',
        color: '#fff',
        letterSpacing: 4,
    },
    logoSubtext: {
        fontSize: 12,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.7)',
        letterSpacing: 2,
    },
});
