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
import Svg, { Polygon, Line, Circle, Rect, Defs, Pattern } from 'react-native-svg';

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
    ELITE: { color: '#FFD700', label: 'NIVEL SELECCIÓN', glow: '#FFD700', message: '¡Un distinto! Nivel selección.' },
    PRO: { color: '#A855F7', label: 'JUGADOR DE PRIMERA', glow: '#A855F7', message: 'Marcás la diferencia en la cancha.' },
    AMATEUR: { color: '#00EAFF', label: 'CRACK DE BARRIO', glow: '#00EAFF', message: 'El que nunca te deja a gamba.' },
    BASE: { color: '#E5E4E2', label: 'PROMESA', glow: '#E5E4E2', message: '¡A meterle garra y crecer!' },
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

    useEffect(() => {
        shineX.value = withRepeat(withTiming(CARD_WIDTH * 1.5, { duration: 4000, easing: Easing.bezier(0.4, 0, 0.2, 1) }), -1, false);
        pulse.value = withRepeat(withTiming(1.08, { duration: 1500, easing: Easing.inOut(Easing.ease) }), -1, true);
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
                    <View style={styles.shieldContainer}>
                        <View style={[styles.borderOuter, { borderColor: rarity.color, shadowColor: rarity.color }]}>
                            <LinearGradient colors={['#e5e4e2', '#ffffff', '#b4b4b4', '#e5e4e2']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.metallicBorderWrapper}>
                                <View style={[styles.borderInner, { borderColor: 'rgba(0,0,0,0.3)' }]}>
                                    <View style={styles.cardGradientContainer}>
                                        <LinearGradient
                                            colors={['#0a1628', '#16213e', '#0f1a2e']}
                                            style={StyleSheet.absoluteFill}
                                        />

                                        {/* Carbon pattern SVG filling absolute container */}
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
                                            <View style={styles.headerSection}>
                                                <View style={styles.ratingContainer}>
                                                    <Animated.Text style={[styles.overallLarge, overallPulseStyle, {
                                                        color: '#fff',
                                                        textShadowColor: rarity.glow,
                                                        textShadowOffset: { width: 0, height: 2 },
                                                        textShadowRadius: 4 // Focused shadow, not a 'stain'
                                                    }]}>
                                                        {Math.round(overall * 10)}
                                                    </Animated.Text>
                                                </View>
                                                <View style={styles.categoryContainer}>
                                                    <LinearGradient colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']} style={styles.categoryBadge}>
                                                        <Text style={styles.categoryText}>{AGE_CATEGORY_LABELS[category]}</Text>
                                                    </LinearGradient>
                                                </View>
                                            </View>

                                            <View style={styles.avatarStarSection}>
                                                <Svg style={styles.starSvg} viewBox="0 0 200 200">
                                                    <Polygon points="100,20 120,80 185,80 135,115 155,175 100,140 45,175 65,115 15,80 80,80" fill="rgba(255, 255, 255, 0.05)" stroke={rarity.color} strokeWidth="4" />
                                                </Svg>
                                                {avatar && (
                                                    <View style={styles.avatarFrameLarge}>
                                                        <Image source={(typeof avatar === 'string' && !isNaN(Number(avatar))) ? Number(avatar) : (typeof avatar === 'string' ? { uri: avatar } : avatar)} style={styles.avatarImage} contentFit="cover" />
                                                    </View>
                                                )}
                                            </View>

                                            <View style={styles.identitySection}>
                                                <Text style={styles.playerName} numberOfLines={1}>{nickname}</Text>
                                                <Text style={styles.playerPosition}>{POSITION_LABELS[mainPosition]}{specificRole ? ` - ${specificRole}` : ''}</Text>
                                                <View style={styles.footBadgeMini}>
                                                    <MaterialCommunityIcons name="shoe-cleat" size={10} color="#00FFFF" />
                                                    <Text style={styles.footTextSmall}>Pie: {FOOT_LABELS[dominantFoot]}</Text>
                                                </View>
                                                <View style={styles.badgeContainer}>
                                                    <LinearGradient colors={[rarity.color, `${rarity.color}CC`, rarity.color]} style={styles.capsuleBadge} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}>
                                                        <MotiView from={{ translateX: -100 }} animate={{ translateX: 200 }} transition={{ loop: true, duration: 2500, type: 'timing', easing: Easing.bezier(0.4, 0, 0.2, 1) }} style={styles.badgeShine}>
                                                            <LinearGradient colors={['transparent', 'rgba(255,255,255,0.3)', 'transparent']} style={{ flex: 1 }} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
                                                        </MotiView>
                                                        <Text style={styles.badgeTitle}>{rarity.label}</Text>
                                                    </LinearGradient>
                                                    <Text style={styles.badgeSubtitle}>{rarity.message}</Text>
                                                </View>
                                            </View>

                                            <View style={styles.statsDoubleColumn}>
                                                <View style={styles.statsColumnLeft}>
                                                    {orderedStats.slice(0, 3).map((stat, index) => {
                                                        return (
                                                            <MotiView key={stat.key} from={{ opacity: 0, translateX: -20 }} animate={{ opacity: 1, translateX: 0 }} transition={{ delay: 400 + (index * 100), type: 'spring' }} style={styles.statItemCompact}>
                                                                <Text style={styles.statValueCompact}>{Math.round(stat.value * 10)}</Text>
                                                                <Text style={styles.statLabelSmall}>{STAT_LABELS[stat.key as keyof StatsRadar]}</Text>
                                                            </MotiView>
                                                        );
                                                    })}
                                                </View>
                                                <View style={styles.statsColumnRight}>
                                                    {orderedStats.slice(3, 6).map((stat, index) => {
                                                        return (
                                                            <MotiView key={stat.key} from={{ opacity: 0, translateX: 20 }} animate={{ opacity: 1, translateX: 0 }} transition={{ delay: 400 + (index * 100), type: 'spring' }} style={styles.statItemCompact}>
                                                                <Text style={styles.statValueCompact}>{Math.round(stat.value * 10)}</Text>
                                                                <Text style={styles.statLabelSmall}>{STAT_LABELS[stat.key as keyof StatsRadar]}</Text>
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
                                    </View>
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
    container: { width: CARD_WIDTH, height: CARD_HEIGHT, alignItems: 'center', justifyContent: 'center', marginVertical: 10 },
    cardWrapper: { width: CARD_WIDTH, height: CARD_HEIGHT, padding: 8 },
    shieldContainer: { flex: 1, overflow: 'visible' },
    borderOuter: { flex: 1, borderWidth: 4, borderRadius: 28, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 25, elevation: 20, padding: 2 },
    metallicBorderWrapper: { flex: 1, borderRadius: 26, padding: 2 },
    borderInner: { flex: 1, borderWidth: 1.5, borderRadius: 24, overflow: 'hidden' },
    cardGradientContainer: { flex: 1, position: 'relative' },
    fieldSvg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 1 },
    glossyOverlay: { position: 'absolute', width: CARD_WIDTH * 0.5, height: CARD_HEIGHT * 2.5, backgroundColor: 'rgba(255,255,255,0.06)', top: -CARD_HEIGHT * 0.5 },
    contentContainer: { flex: 1, paddingHorizontal: 15, paddingVertical: 10, justifyContent: 'space-between' },
    headerSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 20, paddingHorizontal: 15 },
    ratingContainer: { alignItems: 'center', overflow: 'visible', paddingLeft: 5 },
    categoryContainer: { alignItems: 'center' },
    overallLarge: { fontSize: 60, fontWeight: '900', lineHeight: 60, includeFontPadding: false },
    avatarStarSection: { alignItems: 'center', justifyContent: 'center', height: 160, position: 'relative' },
    starSvg: { position: 'absolute', width: 200, height: 200 },
    avatarFrameLarge: { width: 145, height: 145, borderRadius: 72, overflow: 'hidden', borderWidth: 3.5, borderColor: 'rgba(255,255,255,0.7)', position: 'absolute' },
    avatarImage: { width: '100%', height: '100%' },
    identitySection: { alignItems: 'center', gap: 1 },
    playerName: { fontSize: 26, fontWeight: '900', color: '#fff', textAlign: 'center', textTransform: 'uppercase', textShadowColor: 'rgba(0,0,0,0.8)', textShadowOffset: { width: 0, height: 3 }, textShadowRadius: 6, letterSpacing: 3 },
    playerPosition: { fontSize: 11, fontWeight: '700', color: '#00FFFF', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 1 },
    footBadgeMini: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 3 },
    footTextSmall: { fontSize: 9, fontWeight: '600', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' },
    categoryBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
    categoryText: { fontSize: 11, fontWeight: '900', color: '#fff', letterSpacing: 1.2 },
    badgeContainer: { alignItems: 'center' },
    capsuleBadge: { paddingHorizontal: 18, paddingVertical: 5, borderRadius: 20, borderWidth: 1.2, borderColor: 'rgba(255,255,255,0.3)', overflow: 'hidden', position: 'relative' },
    badgeShine: { position: 'absolute', top: 0, bottom: 0, width: 30, opacity: 0.5 },
    badgeTitle: { fontSize: 10, fontWeight: '900', color: '#fff', letterSpacing: 1.2, textAlign: 'center' },
    badgeSubtitle: { fontSize: 8.5, fontWeight: '700', color: 'rgba(255,255,255,0.6)', fontStyle: 'italic', marginTop: 2, textAlign: 'center' },
    statsDoubleColumn: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 40, marginBottom: 2 },
    statsColumnLeft: { alignItems: 'flex-start', gap: 2 },
    statsColumnRight: { alignItems: 'flex-end', gap: 2 },
    statItemCompact: { alignItems: 'center' },
    statValueCompact: { fontSize: 22, fontWeight: '900', color: '#fff', textShadowColor: 'rgba(0,0,0,0.9)', textShadowOffset: { width: 0, height: 3 }, textShadowRadius: 5 },
    statLabelSmall: { fontSize: 9, fontWeight: '900', color: '#00FFFF', marginTop: -2, letterSpacing: 1 },
    logoWatermark: { alignItems: 'center', opacity: 0.25, paddingBottom: 5 },
    logoText: { fontSize: 10, fontWeight: '900', color: '#fff', letterSpacing: 5 },
    logoSubtext: { fontSize: 7, fontWeight: '800', color: 'rgba(255,255,255,0.6)', letterSpacing: 3, marginTop: -2 },
});
