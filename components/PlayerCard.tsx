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
import { StatsRadar, PositionEnum, FootEnum, AgeCategoryEnum, POSITION_LABELS, FOOT_LABELS, AGE_CATEGORY_LABELS } from '@/types';
import Svg, { Polygon, Line, Circle, Rect } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.88;
const ASPECT_RATIO = 1 / 1.5;
const CARD_HEIGHT = CARD_WIDTH / ASPECT_RATIO;

interface PlayerCardProps {
    nickname: string;
    avatar?: string | number | any;
    stats: StatsRadar;
    mainPosition: PositionEnum;
    specificRole?: string;
    overall: number;
    dominantFoot?: FootEnum;
    category?: AgeCategoryEnum;
}

const RARITY = {
    ELITE: {
        color: '#FFD700',
        label: 'NIVEL SELECCIÓN',
        glow: '#FFD700',
        message: '¡Un distinto! Nivel selección.'
    },
    PRO: {
        color: '#A855F7',
        label: 'JUGADOR DE PRIMERA',
        glow: '#A855F7',
        message: 'Marcás la diferencia en la cancha.'
    },
    AMATEUR: {
        color: '#00EAFF',
        label: 'CRACK DE BARRIO',
        glow: '#00EAFF',
        message: 'El que nunca te deja a gamba.'
    },
    BASE: {
        color: '#E5E4E2',
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
    overall,
    dominantFoot = FootEnum.RIGHT,
    category = AgeCategoryEnum.SUB21
}: PlayerCardProps) {
    const rarity = useMemo(() => getRarity(overall), [overall]);

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
                    <View style={styles.shieldContainer}>
                        <View style={[styles.borderOuter, { borderColor: rarity.color, shadowColor: rarity.color }]}>
                            <LinearGradient
                                colors={['#e5e4e2', '#ffffff', '#b4b4b4', '#e5e4e2']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.metallicBorderWrapper}
                            >
                                <View style={[styles.borderInner, { borderColor: 'rgba(0,0,0,0.3)' }]}>
                                    <LinearGradient
                                        colors={['#0a1628', '#16213e', '#0f1a2e']}
                                        style={styles.cardGradient}
                                    >
                                        <Svg style={styles.fieldSvg} viewBox="0 0 300 400">
                                            <Line x1="50" y1="200" x2="250" y2="200" stroke="rgba(0, 217, 255, 0.15)" strokeWidth="2" />
                                            <Line x1="50" y1="280" x2="250" y2="280" stroke="rgba(0, 217, 255, 0.15)" strokeWidth="2" />
                                            <Line x1="50" y1="320" x2="250" y2="320" stroke="rgba(0, 217, 255, 0.15)" strokeWidth="2" />
                                            <Circle cx="150" cy="200" r="40" fill="none" stroke="rgba(0, 217, 255, 0.15)" strokeWidth="2" />
                                            <Rect x="120" y="310" width="60" height="20" fill="none" stroke="rgba(0, 217, 255, 0.15)" strokeWidth="2" />
                                            <Line x1="0" y1="150" x2="100" y2="250" stroke="rgba(0, 217, 255, 0.08)" strokeWidth="1" />
                                            <Line x1="300" y1="150" x2="200" y2="250" stroke="rgba(0, 217, 255, 0.08)" strokeWidth="1" />
                                        </Svg>

                                        <Animated.View style={[styles.glossyOverlay, shineStyle]} />

                                        <View style={styles.contentContainer}>
                                            <View style={styles.headerSection}>
                                                <View style={styles.ratingContainer}>
                                                    <Animated.Text style={[styles.overallLarge, overallPulseStyle, {
                                                        color: '#fff',
                                                        textShadowColor: rarity.glow,
                                                        textShadowOffset: { width: 0, height: 0 },
                                                        textShadowRadius: 20,
                                                    }]}>
                                                        {Math.round(overall * 10)}
                                                    </Animated.Text>
                                                </View>

                                                <View style={styles.categoryContainer}>
                                                    <LinearGradient
                                                        colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
                                                        style={styles.categoryBadge}
                                                    >
                                                        <Text style={styles.categoryText}>
                                                            {AGE_CATEGORY_LABELS[category]}
                                                        </Text>
                                                    </LinearGradient>
                                                </View>
                                            </View>

                                            <View style={styles.avatarStarSection}>
                                                <Svg style={styles.starSvg} viewBox="0 0 200 200">
                                                    <Polygon
                                                        points="100,20 120,80 185,80 135,115 155,175 100,140 45,175 65,115 15,80 80,80"
                                                        fill="rgba(255, 255, 255, 0.05)"
                                                        stroke={rarity.color}
                                                        strokeWidth="4"
                                                    />
                                                </Svg>

                                                {avatar && (
                                                    <View style={styles.avatarFrameLarge}>
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

                                            <View style={styles.identitySection}>
                                                <Text style={styles.playerName} numberOfLines={1}>
                                                    {nickname}
                                                </Text>

                                                <Text style={styles.playerPosition}>
                                                    {POSITION_LABELS[mainPosition]}{specificRole ? ` - ${specificRole}` : ''}
                                                </Text>

                                                <View style={styles.footBadgeMini}>
                                                    <MaterialCommunityIcons name="shoe-cleat" size={12} color="rgba(255,255,255,0.8)" />
                                                    <Text style={styles.footTextSmall}>Pie: {FOOT_LABELS[dominantFoot]}</Text>
                                                </View>

                                                <View style={styles.badgeContainer}>
                                                    <LinearGradient
                                                        colors={overall >= 9.0 ? ['#FFD700', '#FFA500', '#FF8C00'] : [rarity.color, `${rarity.color}DD`, `${rarity.color}AA`]}
                                                        style={styles.plateContainer}
                                                        start={{ x: 0, y: 0 }}
                                                        end={{ x: 1, y: 1 }}
                                                    >
                                                        <View style={styles.plateInlay}>
                                                            <Text style={styles.badgeTitle}>{rarity.label}</Text>
                                                        </View>
                                                    </LinearGradient>
                                                    <Text style={styles.badgeSubtitle}>{rarity.message}</Text>
                                                </View>
                                            </View>

                                            <View style={styles.statsDoubleColumn}>
                                                <View style={styles.statsColumnLeft}>
                                                    {statsEntries.slice(0, 3).map(([key, value], index) => {
                                                        const statColor = value >= 8 ? rarity.color : '#fff';
                                                        return (
                                                            <MotiView
                                                                key={key}
                                                                from={{ opacity: 0, translateX: -20 }}
                                                                animate={{ opacity: 1, translateX: 0 }}
                                                                transition={{ delay: 400 + (index * 100), type: 'spring' }}
                                                                style={styles.statItemCompact}
                                                            >
                                                                <Text style={[styles.statValueCompact, { color: statColor }]}>
                                                                    {Math.round(value * 10)}
                                                                </Text>
                                                                <Text style={styles.statLabelSmall}>
                                                                    {STAT_LABELS[key]}
                                                                </Text>
                                                            </MotiView>
                                                        );
                                                    })}
                                                </View>

                                                <View style={styles.statsColumnRight}>
                                                    {statsEntries.slice(3, 6).map(([key, value], index) => {
                                                        const statColor = value >= 8 ? rarity.color : '#fff';
                                                        return (
                                                            <MotiView
                                                                key={key}
                                                                from={{ opacity: 0, translateX: 20 }}
                                                                animate={{ opacity: 1, translateX: 0 }}
                                                                transition={{ delay: 400 + (index * 100), type: 'spring' }}
                                                                style={styles.statItemCompact}
                                                            >
                                                                <Text style={[styles.statValueCompact, { color: statColor }]}>
                                                                    {Math.round(value * 10)}
                                                                </Text>
                                                                <Text style={styles.statLabelSmall}>
                                                                    {STAT_LABELS[key]}
                                                                </Text>
                                                            </MotiView>
                                                        );
                                                    })}
                                                </View>
                                            </View>

                                            <View style={styles.logoWatermark}>
                                                <Text style={styles.logoText}>FALTA UNO</Text>
                                                <Text style={styles.logoSubtext}>CARDS</Text>
                                            </View>
                                        </View>
                                    </LinearGradient>
                                </View>
                            </LinearGradient>
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
        padding: 10,
    },
    shieldContainer: {
        flex: 1,
        overflow: 'visible',
    },
    borderOuter: {
        flex: 1,
        borderWidth: 5,
        borderRadius: 28,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 35,
        elevation: 35,
        padding: 2,
    },
    metallicBorderWrapper: {
        flex: 1,
        borderRadius: 26,
        padding: 2,
    },
    borderInner: {
        flex: 1,
        borderWidth: 1.5,
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
        paddingHorizontal: 15,
        paddingVertical: 15,
        justifyContent: 'space-between',
    },
    headerSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 10,
        paddingHorizontal: 5,
    },
    ratingContainer: {
        alignItems: 'center',
    },
    categoryContainer: {
        alignItems: 'center',
    },
    overallLarge: {
        fontSize: 68,
        fontWeight: '900',
        lineHeight: 68,
        includeFontPadding: false,
    },
    avatarStarSection: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 180,
        position: 'relative',
    },
    starSvg: {
        position: 'absolute',
        width: 220,
        height: 220,
    },
    avatarFrameLarge: {
        width: 160,
        height: 160,
        borderRadius: 80,
        overflow: 'hidden',
        borderWidth: 4,
        borderColor: 'rgba(255,255,255,0.6)',
        position: 'absolute',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    identitySection: {
        alignItems: 'center',
        gap: 2,
    },
    playerName: {
        fontSize: 32,
        fontWeight: '900',
        color: '#fff',
        textAlign: 'center',
        textTransform: 'uppercase',
        textShadowColor: 'rgba(0,0,0,0.9)',
        textShadowOffset: { width: 0, height: 3 },
        textShadowRadius: 6,
        letterSpacing: 2,
    },
    playerPosition: {
        fontSize: 13,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.8)',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    footBadgeMini: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 2,
        marginBottom: 4,
    },
    footTextSmall: {
        fontSize: 10,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.6)',
        textTransform: 'uppercase',
    },
    categoryBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    categoryText: {
        fontSize: 12,
        fontWeight: '900',
        color: '#fff',
        letterSpacing: 1.5,
    },
    badgeContainer: {
        alignItems: 'center',
    },
    plateContainer: {
        padding: 2,
        borderRadius: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.9,
        shadowRadius: 10,
        elevation: 15,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.4)',
    },
    plateInlay: {
        backgroundColor: 'rgba(0,0,0,0.15)',
        paddingHorizontal: 16,
        paddingVertical: 5,
        borderRadius: 2,
        borderWidth: 1.5,
        borderColor: 'rgba(0,0,0,0.3)',
    },
    badgeTitle: {
        fontSize: 12,
        fontWeight: '900',
        color: '#000',
        letterSpacing: 1.2,
        textAlign: 'center',
    },
    badgeSubtitle: {
        fontSize: 10,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.7)',
        fontStyle: 'italic',
        marginTop: 2,
        textAlign: 'center',
    },
    statsDoubleColumn: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 35,
    },
    statsColumnLeft: {
        alignItems: 'flex-start',
        gap: 4,
    },
    statsColumnRight: {
        alignItems: 'flex-end',
        gap: 4,
    },
    statItemCompact: {
        alignItems: 'center',
    },
    statValueCompact: {
        fontSize: 24,
        fontWeight: '900',
        textShadowColor: 'rgba(0,0,0,0.9)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 5,
    },
    statLabelSmall: {
        fontSize: 10,
        fontWeight: '900',
        color: '#E5E4E2',
        marginTop: -2,
        letterSpacing: 1.2,
    },
    logoWatermark: {
        alignItems: 'center',
        opacity: 0.8,
    },
    logoText: {
        fontSize: 14,
        fontWeight: '900',
        color: '#fff',
        letterSpacing: 3,
    },
    logoSubtext: {
        fontSize: 10,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.7)',
        letterSpacing: 2,
    },
});
