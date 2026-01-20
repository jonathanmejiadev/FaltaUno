import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import {
    Gesture,
    GestureDetector,
    GestureHandlerRootView
} from 'react-native-gesture-handler';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    interpolate,
    Easing
} from 'react-native-reanimated';
import Colors from '@/constants/colors';
import { StatsRadar } from '@/types';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;

interface PlayerCardProps {
    nickname: string;
    avatar?: string;
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
    if (overall >= 9.0) return "¡Nivel Selección! Un distinto.";
    if (overall >= 7.0) return "Jugador de Primera. Marcás la diferencia.";
    if (overall >= 5.0) return "Crack de Barrio. Siempre cumple.";
    return "Promesa. ¡A meterle garra!";
};

export default function PlayerCard({
    nickname,
    avatar,
    stats,
    mainPosition,
    specificRole,
    overall
}: PlayerCardProps) {
    const rotateX = useSharedValue(0);
    const rotateY = useSharedValue(0);

    const gesture = Gesture.Pan()
        .onUpdate((event) => {
            // Limit the tilt to about 15 degrees
            rotateX.value = interpolate(event.y, [0, 400], [15, -15]);
            rotateY.value = interpolate(event.x, [0, CARD_WIDTH], [-15, 15]);
        })
        .onEnd(() => {
            rotateX.value = withSpring(0);
            rotateY.value = withSpring(0);
        });

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { perspective: 1000 },
                { rotateX: `${rotateX.value}deg` },
                { rotateY: `${rotateY.value}deg` },
            ],
        };
    });

    const shineStyle = useAnimatedStyle(() => {
        return {
            opacity: interpolate(
                Math.abs(rotateX.value) + Math.abs(rotateY.value),
                [0, 20],
                [0, 0.3]
            ),
            transform: [
                { translateX: rotateY.value * 10 },
                { translateY: rotateX.value * 10 },
            ],
        };
    });

    return (
        <View style={styles.container}>
            <GestureDetector gesture={gesture}>
                <Animated.View style={[styles.cardContainer, animatedStyle]}>
                    <MotiView
                        from={{ scale: 0.7, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                            type: 'spring',
                            damping: 12,
                            stiffness: 90,
                        }}
                        style={styles.motiWrapper}
                    >
                        <LinearGradient
                            colors={[Colors.dark.surface, Colors.dark.background, '#1a1a1f']}
                            style={styles.gradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            {/* Neon Border */}
                            <View style={styles.neonBorder} />

                            {/* Shine effect */}
                            <Animated.View style={[styles.shine, shineStyle]}>
                                <LinearGradient
                                    colors={['transparent', 'rgba(255,255,255,0.2)', 'transparent']}
                                    style={StyleSheet.absoluteFill}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                />
                            </Animated.View>

                            <View style={styles.cardHeader}>
                                <View style={styles.overallContainer}>
                                    <Text style={styles.overallText}>{overall.toFixed(1)}</Text>
                                    <Text style={styles.overallLabel}>MEDIA</Text>
                                </View>

                                <View style={styles.avatarWrapper}>
                                    {avatar ? (
                                        <Image source={{ uri: avatar }} style={styles.avatar} />
                                    ) : (
                                        <View style={[styles.avatar, styles.avatarPlaceholder]}>
                                            <Text style={styles.avatarInitial}>{nickname?.[0]?.toUpperCase() || 'P'}</Text>
                                        </View>
                                    )}
                                </View>
                            </View>

                            <View style={styles.cardBody}>
                                <Text style={styles.nickname} numberOfLines={1}>{nickname}</Text>
                                <Text style={styles.position}>
                                    {mainPosition} {specificRole ? `• ${specificRole}` : ''}
                                </Text>
                                <Text style={styles.personality}>{getPersonalityMessage(overall)}</Text>
                            </View>

                            <View style={styles.statsContainer}>
                                {(Object.entries(stats) as [keyof StatsRadar, number][]).map(([key, value]) => (
                                    <View key={key} style={styles.statRow}>
                                        <Text style={styles.statLabel}>{STAT_LABELS[key]}</Text>
                                        <View style={styles.barBackground}>
                                            <MotiView
                                                from={{ width: '0%' }}
                                                animate={{ width: `${value * 10}%` }}
                                                transition={{
                                                    type: 'timing',
                                                    duration: 1000,
                                                    easing: Easing.out(Easing.quad),
                                                }}
                                                style={[styles.barFill, { backgroundColor: Colors.dark.primary }]}
                                            />
                                        </View>
                                        <Text style={styles.statValue}>{value}</Text>
                                    </View>
                                ))}
                            </View>
                        </LinearGradient>
                    </MotiView>
                </Animated.View>
            </GestureDetector>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 10,
    },
    cardContainer: {
        width: CARD_WIDTH,
        height: CARD_WIDTH * 1.4,
        borderRadius: 20,
        backgroundColor: Colors.dark.surface,
        // Shadow for depth
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 15,
        elevation: 20,
    },
    motiWrapper: {
        flex: 1,
    },
    gradient: {
        flex: 1,
        padding: 24,
        borderRadius: 20,
        justifyContent: 'space-between',
        overflow: 'hidden',
    },
    neonBorder: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: Colors.dark.primary,
        opacity: 0.4,
    },
    shine: {
        position: 'absolute',
        width: '200%',
        height: '200%',
        top: '-50%',
        left: '-50%',
        zIndex: 1,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 2,
    },
    overallContainer: {
        alignItems: 'center',
    },
    overallText: {
        fontSize: 56,
        fontWeight: '900',
        color: Colors.dark.primary,
        lineHeight: 56,
        textShadowColor: Colors.dark.primaryGlow,
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 15,
    },
    overallLabel: {
        fontSize: 10,
        fontWeight: '800',
        color: Colors.dark.textSecondary,
        letterSpacing: 3,
        marginTop: -5,
    },
    avatarWrapper: {
        width: 90,
        height: 90,
        borderRadius: 45,
        borderWidth: 2,
        borderColor: Colors.dark.primary,
        overflow: 'hidden',
        backgroundColor: Colors.dark.surfaceLight,
        padding: 2,
    },
    avatar: {
        width: '100%',
        height: '100%',
        borderRadius: 45,
    },
    avatarPlaceholder: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarInitial: {
        fontSize: 36,
        fontWeight: '800',
        color: Colors.dark.textSecondary,
    },
    cardBody: {
        alignItems: 'center',
        marginTop: 0,
        zIndex: 2,
    },
    nickname: {
        fontSize: 28,
        fontWeight: '900',
        color: Colors.dark.text,
        textAlign: 'center',
        textTransform: 'uppercase',
    },
    position: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.dark.primary,
        textTransform: 'uppercase',
        marginTop: 2,
        letterSpacing: 1.5,
    },
    personality: {
        fontSize: 14,
        color: Colors.dark.textSecondary,
        marginTop: 8,
        fontWeight: '500',
        textAlign: 'center',
    },
    statsContainer: {
        gap: 10,
        zIndex: 2,
    },
    statRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    statLabel: {
        width: 35,
        fontSize: 13,
        fontWeight: '800',
        color: Colors.dark.textSecondary,
    },
    barBackground: {
        flex: 1,
        height: 8,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 4,
        overflow: 'hidden',
    },
    barFill: {
        height: '100%',
        borderRadius: 4,
        // Add a slight glow to the bar
        shadowColor: Colors.dark.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 5,
    },
    statValue: {
        width: 25,
        fontSize: 15,
        fontWeight: '900',
        color: Colors.dark.text,
        textAlign: 'right',
    },
});
