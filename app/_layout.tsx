import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { View, ActivityIndicator } from "react-native";
import { useAppStore } from "@/store/useAppStore";
import Colors from "@/constants/colors";
import AsyncStorage from "@react-native-async-storage/async-storage";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function useProtectedRoute(isOnboarded: boolean, isReady: boolean) {
  const segments = useSegments();
  const router = useRouter();
  const hasNavigated = React.useRef(false);

  useEffect(() => {
    if (!isReady) return;

    const inOnboarding = segments[0] === 'onboarding';

    if (!isOnboarded && !inOnboarding) {
      if (!hasNavigated.current) {
        hasNavigated.current = true;
        console.log('[Navigation] Redirecting to onboarding');
        router.replace('/onboarding');
      }
    } else if (isOnboarded && inOnboarding) {
      if (!hasNavigated.current) {
        hasNavigated.current = true;
        console.log('[Navigation] Redirecting to home');
        router.replace('/');
      }
    } else {
      hasNavigated.current = false;
    }
  }, [isOnboarded, isReady, segments, router]);
}

function RootLayoutNav() {
  const { isOnboarded } = useAppStore();
  const [isReady, setIsReady] = useState(false);

  useProtectedRoute(isOnboarded, isReady);

  useEffect(() => {
    const init = async () => {
      try {
        await useAppStore.getState().loadStoredUser();
      } catch (error) {
        console.error('[Layout] Error loading user:', error);
      } finally {
        setIsReady(true);
        try {
          // Wrap in try-catch to avoid "No native splash screen registered" error
          await SplashScreen.hideAsync();
        } catch (e) {
          console.warn('[SplashScreen] hideAsync error:', e);
        }
      }
    };
    init();
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.dark.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={Colors.dark.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.dark.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding/index" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding/position" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding/stats" options={{ headerShown: false }} />
        <Stack.Screen
          name="match/[id]"
          options={{
            presentation: 'modal',
            headerShown: false,
          }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <RootLayoutNav />
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
