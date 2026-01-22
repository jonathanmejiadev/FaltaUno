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
import Svg, { Polygon, Defs, Pattern, Rect } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.88;
const ASPECT_RATIO = 1 / 1.55;
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
    ELITE: { color: '#FFD700', label: 'NIVEL SELECCIÓN', glow: '#FFD700', message: '¡Un distinto!' },
    PRO: { color: '#A855F7', label: 'JUGADOR DE PRIMERA', glow: '#A855F7', message: 'Marcás la diferencia en la cancha.' },
    AMATEUR: { color: '#00EAFF', label: 'CRACK DE BARRIO', glow: '#00EAFF', message: 'Nunca decepciona.' },
    BASE: { color: '#E5E4E2', label: 'PROMESA', glow: '#E5E4E2', message: '¡En progreso!' },
};

const getRarity = (overall: number) => {
    if (overall >= 9.0) return RARITY.ELITE;
    if (overall >= 7.5) return RARITY.PRO;
    if (overall >= 6.0) return RARITY.AMATEUR;
    return RARITY.BASE;
};

const STAT_LABELS: Record<keyof StatsRadar, string> = {
    pace: 'RIT', shooting: 'TIR', passing: 'PAS', defense: 'DEF', physical: 'FÍS', stamina: 'RES',
};

export default function PlayerCard({
    nickname, avatar, stats, mainPosition, specificRole, overall, dominantFoot = FootEnum.RIGHT, category = AgeCategoryEnum.SUB21
}: PlayerCardProps) {
    const rarity = useMemo(() => getRarity(overall), [overall]);
    const shineX = useSharedValue(-CARD_WIDTH * 1.5);
    const rotateX = useSharedValue(0);
    const rotateY = useSharedValue(0);
    const scale = useSharedValue(1);
    const pulse = useSharedValue(1);
    const shimmerX = useSharedValue(-150);

    useEffect(() => {
        shineX.value = withRepeat(withTiming(CARD_WIDTH * 1.5, { duration: 4000, easing: Easing.bezier(0.4, 0, 0.2, 1) }), -1, false);
        pulse.value = withRepeat(withTiming(1.08, { duration: 1500, easing: Easing.inOut(Easing.ease) }), -1, true);
        shimmerX.value = withRepeat(withTiming(150, { duration: 3000, easing: Easing.bezier(0.4, 0, 0.2, 1) }), -1, false);
    }, []);

    const gesture = Gesture.Pan().onBegin(() => { scale.value = withSpring(1.05); })
        .onUpdate((event) => {
            rotateY.value = interpolate(event.translationX, [-CARD_WIDTH / 2, CARD_WIDTH / 2], [12, -12], Extrapolate.CLAMP);
            rotateX.value = interpolate(event.translationY, [-CARD_HEIGHT / 2, CARD_HEIGHT / 2], [-12, 12], Extrapolate.CLAMP);
        })
        .onEnd(() => { rotateX.value = withSpring(0); rotateY.value = withSpring(0); scale.value = withSpring(1); });

    const cardAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ perspective: 1000 }, { rotateX: `${rotateX.value}deg` }, { rotateY: `${rotateY.value}deg` }, { scale: scale.value }],
    }));
    const shineStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shineX.value }, { skewX: '-25deg' }] }));
    const overallPulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));
    const shimmerStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shimmerX.value }] }));

    const orderedStats = useMemo(() => {
        return [
            { key: 'pace', value: stats.pace },
            { key: 'shooting', value: stats.shooting },
            { key: 'passing', value: stats.passing },
            { key: 'defense', value: stats.defense },
            { key: 'physical', value: stats.physical },
            { key: 'stamina', value: stats.stamina },
        ];
    }, [stats]);

    return (
        <View style={styles.container}>
            <GestureDetector gesture={gesture}>
                <Animated.View style={[styles.cardWrapper, cardAnimatedStyle]}>
                    {/* Single Unified Border with Outer Glow */}
                    <View style={[styles.unifiedBorder, {
                        borderColor: rarity.color,
                        shadowColor: rarity.glow,
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 0.9,
                        shadowRadius: 25,
                        elevation: 25
                    }]}>
                        <View style={styles.cardGradientContainer}>
                            <LinearGradient
                                colors={['#0a1628', '#16213e', '#0f1a2e']}
                                style={StyleSheet.absoluteFill}
                            />

                            <Svg style={styles.fieldSvg}>
                                <Defs>
                                    <Pattern id="carbonPattern" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                                        <Rect width="3" height="6" fill="rgba(255,255,255,0.06)" />
                                    </Pattern>
                                </Defs>
                                <Rect width="100%" height="100%" fill="url(#carbonPattern)" />
                            </Svg>

                            <Animated.View style={[styles.glossyOverlay, shineStyle]} />

                            <View style={styles.contentContainer}>
                                {/* Header: Overall + Neon Master Badge */}
                                <View style={styles.headerSection}>
                                    <View style={styles.ratingContainer}>
                                        <Animated.Text style={[styles.overallLarge, overallPulseStyle, {
                                            color: '#fff',
                                            textShadowColor: rarity.glow,
                                            textShadowOffset: { width: 0, height: 2 },
                                            textShadowRadius: 4
                                        }]}>
                                            {Math.round(overall * 10)}
                                        </Animated.Text>
                                    </View>
                                    <View style={styles.categoryContainer}>
                                        <View style={[styles.neonMasterBadge, { borderColor: rarity.color }]}>
                                            <Text style={[styles.masterText, { color: rarity.color }]}>{AGE_CATEGORY_LABELS[category]}</Text>
                                        </View>
                                    </View>
                                </View>

                                {/* Avatar with Rim Light - Moved Up */}
                                <View style={styles.avatarStarSection}>
                                    <Svg style={styles.starSvg} viewBox="0 0 200 200">
                                        <Polygon points="100,20 120,80 185,80 135,115 155,175 100,140 45,175 65,115 15,80 80,80" fill="rgba(255, 255, 255, 0.05)" stroke={rarity.color} strokeWidth="4" />
                                    </Svg>
                                    {avatar && (
                                        <View style={[styles.avatarFrameLarge, {
                                            borderColor: rarity.color,
                                            shadowColor: rarity.color,
                                            shadowOffset: { width: 0, height: 0 },
                                            shadowOpacity: 0.8,
                                            shadowRadius: 8
                                        }]}>
                                            <Image source={(typeof avatar === 'string' && !isNaN(Number(avatar))) ? Number(avatar) : (typeof avatar === 'string' ? { uri: avatar } : avatar)} style={styles.avatarImage} contentFit="cover" />
                                        </View>
                                    )}
                                </View>

                                {/* Identity Section - More Vertical Space */}
                                <View style={styles.identitySection}>
                                    <Text style={styles.playerName} numberOfLines={1}>{nickname}</Text>
                                    <Text style={[styles.playerPosition, { color: rarity.color }]}>{POSITION_LABELS[mainPosition]}{specificRole ? ` - ${specificRole}` : ''}</Text>

                                    {/* Foot Badge: Icon + Text only */}
                                    <View style={styles.footBadgeMini}>
                                        <MaterialCommunityIcons name="shoe-cleat" size={11} color={rarity.color} />
                                        <Text style={styles.footTextSmall}>{FOOT_LABELS[dominantFoot]}</Text>
                                    </View>

                                    {/* Rarity Badge with Shimmer - Moved Down */}
                                    <View style={styles.badgeContainer}>
                                        <LinearGradient
                                            colors={overall >= 6.0 ? [rarity.color, rarity.color] : [rarity.color, `${rarity.color}DD`, rarity.color]}
                                            style={styles.capsuleBadge}
                                            start={{ x: 0, y: 0.5 }}
                                            end={{ x: 1, y: 0.5 }}
                                        >
                                            {overall >= 6.0 && (
                                                <Animated.View style={[styles.shimmerOverlay, shimmerStyle]}>
                                                    <LinearGradient
                                                        colors={['transparent', 'rgba(255,255,255,0.5)', 'transparent']}
                                                        style={{ flex: 1 }}
                                                        start={{ x: 0, y: 0 }}
                                                        end={{ x: 1, y: 0 }}
                                                    />
                                                </Animated.View>
                                            )}
                                            <Text style={styles.badgeTitle}>{rarity.label}</Text>
                                        </LinearGradient>
                                        <Text style={styles.badgeSubtitle}>{rarity.message}</Text>
                                    </View>
                                </View>

                                {/* Stats with 3px Progress Bars */}
                                <View style={styles.statsDoubleColumn}>
                                    <View style={styles.statsColumnLeft}>
                                        {orderedStats.slice(0, 3).map((stat, index) => {
                                            const percentage = stat.value / 10;
                                            return (
                                                <MotiView key={stat.key} from={{ opacity: 0, translateX: -20 }} animate={{ opacity: 1, translateX: 0 }} transition={{ delay: 400 + (index * 100), type: 'spring' }} style={styles.statItemCompact}>
                                                    <View style={styles.statContent}>
                                                        <Text style={styles.statValueCompact}>{Math.round(stat.value * 10)}</Text>
                                                        <Text style={[styles.statLabelSmall, { color: rarity.color }]}>{STAT_LABELS[stat.key as keyof StatsRadar]}</Text>
                                                    </View>
                                                    <View style={styles.progressBarContainer}>
                                                        <View style={[styles.progressBarFill, {
                                                            width: `${percentage * 100}%`,
                                                            backgroundColor: rarity.color,
                                                            shadowColor: rarity.color
                                                        }]} />
                                                    </View>
                                                </MotiView>
                                            );
                                        })}
                                    </View>
                                    <View style={styles.statsColumnRight}>
                                        {orderedStats.slice(3, 6).map((stat, index) => {
                                            const percentage = stat.value / 10;
                                            return (
                                                <MotiView key={stat.key} from={{ opacity: 0, translateX: 20 }} animate={{ opacity: 1, translateX: 0 }} transition={{ delay: 400 + (index * 100), type: 'spring' }} style={styles.statItemCompact}>
                                                    <View style={styles.statContent}>
                                                        <Text style={styles.statValueCompact}>{Math.round(stat.value * 10)}</Text>
                                                        <Text style={[styles.statLabelSmall, { color: rarity.color }]}>{STAT_LABELS[stat.key as keyof StatsRadar]}</Text>
                                                    </View>
                                                    <View style={styles.progressBarContainer}>
                                                        <View style={[styles.progressBarFill, {
                                                            width: `${percentage * 100}%`,
                                                            backgroundColor: rarity.color,
                                                            shadowColor: rarity.color
                                                        }]} />
                                                    </View>
                                                </MotiView>
                                            );
                                        })}
                                    </View>
                                </View>

                                {/* Smaller Metallic Logo - Moved Further Down */}
                                <LinearGradient
                                    colors={['#E8E8E8', '#A0A0A0', '#C0C0C0', '#E8E8E8']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.logoWatermark}
                                >
                                    <Text style={styles.logoText}>FALTA UNO</Text>
                                    <Text style={styles.logoSubtext}>CARDS</Text>
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
    container: { width: CARD_WIDTH, height: CARD_HEIGHT, alignItems: 'center', justifyContent: 'center', marginVertical: 10 },
    cardWrapper: { width: CARD_WIDTH, height: CARD_HEIGHT, padding: 6 },
    unifiedBorder: {
        flex: 1,
        borderWidth: 3,
        borderRadius: 26,
        overflow: 'visible',
        backgroundColor: 'transparent'
    },
    cardGradientContainer: { flex: 1, position: 'relative', borderRadius: 23, overflow: 'hidden' },
    fieldSvg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 1 },
    glossyOverlay: { position: 'absolute', width: CARD_WIDTH * 0.5, height: CARD_HEIGHT * 2.5, backgroundColor: 'rgba(255,255,255,0.05)', top: -CARD_HEIGHT * 0.5 },
    contentContainer: { flex: 1, paddingHorizontal: 15, paddingVertical: 12, justifyContent: 'space-between' },
    headerSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, paddingHorizontal: 10 },
    ratingContainer: { alignItems: 'center', overflow: 'visible' },
    categoryContainer: { alignItems: 'center' },
    overallLarge: { fontSize: 64, fontWeight: '900', lineHeight: 64, includeFontPadding: false },
    neonMasterBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        backgroundColor: 'rgba(10, 22, 40, 0.7)'
    },
    masterText: { fontSize: 11, fontWeight: '900', letterSpacing: 1.2 },
    avatarStarSection: { alignItems: 'center', justifyContent: 'center', height: 145, position: 'relative', marginTop: -15 },
    starSvg: { position: 'absolute', width: 200, height: 200 },
    avatarFrameLarge: {
        width: 140,
        height: 140,
        borderRadius: 70,
        overflow: 'hidden',
        borderWidth: 2,
        position: 'absolute'
    },
    avatarImage: { width: '100%', height: '100%' },
    identitySection: { alignItems: 'center', gap: 3, marginVertical: 10 },
    playerName: { fontSize: 25, fontWeight: '900', color: '#fff', textAlign: 'center', textTransform: 'uppercase', textShadowColor: 'rgba(0,0,0,0.8)', textShadowOffset: { width: 0, height: 3 }, textShadowRadius: 6, letterSpacing: 3 },
    playerPosition: { fontSize: 11, fontWeight: '700', color: '#00FFFF', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 8 },
    footBadgeMini: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 5 },
    footTextSmall: { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase', letterSpacing: 0.5 },
    badgeContainer: { alignItems: 'center', marginTop: 4 },
    capsuleBadge: {
        paddingHorizontal: 20,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.4)',
        overflow: 'hidden',
        position: 'relative',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.4,
        shadowRadius: 5
    },
    shimmerOverlay: { position: 'absolute', top: 0, bottom: 0, width: 50, opacity: 0.7 },
    badgeTitle: { fontSize: 10, fontWeight: '900', color: '#fff', letterSpacing: 1.3, textAlign: 'center' },
    badgeSubtitle: { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.65)', fontStyle: 'italic', marginTop: 5, textAlign: 'center' },
    statsDoubleColumn: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 30, marginTop: 4 },
    statsColumnLeft: { alignItems: 'flex-start', gap: 5 },
    statsColumnRight: { alignItems: 'flex-end', gap: 5 },
    statItemCompact: { alignItems: 'center', width: 80 },
    statContent: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    statValueCompact: { fontSize: 24, fontWeight: '900', color: '#fff', textShadowColor: 'rgba(0,0,0,0.9)', textShadowOffset: { width: 0, height: 3 }, textShadowRadius: 5 },
    statLabelSmall: { fontSize: 9, fontWeight: '900', letterSpacing: 1 },
    progressBarContainer: {
        width: '100%',
        height: 3,
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 2,
        overflow: 'hidden',
        marginTop: 2
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 2,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 3
    },
    logoWatermark: {
        alignItems: 'center',
        paddingVertical: 4,
        paddingHorizontal: 12,
        borderRadius: 6,
        alignSelf: 'center',
        marginTop: 8,
        marginBottom: 2
    },
    logoText: { fontSize: 8, fontWeight: '900', color: '#2D3748', letterSpacing: 4, textShadowColor: 'rgba(255,255,255,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 1 },
    logoSubtext: { fontSize: 5, fontWeight: '800', color: '#4A5568', letterSpacing: 2.5, marginTop: -1 },
});
