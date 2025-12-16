import { useEffect, useState } from 'react'; // Tambah useState
import { Slot, useRouter, useSegments, useRootNavigationState } from "expo-router";
import { AppController, useController } from "../src/controllers/AppController";
import AnimatedSplash from "../src/components/SplashScreen"; 

function RootLayoutNav() {
  const { user, isLoading } = useController(); // isLoading ini adalah status Data
  const [isSplashFinished, setIsSplashFinished] = useState(false); // Status baru: Animasi Selesai?
  
  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState();

  // 1. ATUR WAKTU ANIMASI SPLASH (Minimal 2.5 Detik)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSplashFinished(true); // Setelah 2.5 detik, tandai animasi selesai
    }, 2500); 

    return () => clearTimeout(timer);
  }, []);

  // 2. LOGIKA NAVIGASI
  useEffect(() => {
    // TAHAN DULU: Jangan navigasi kalau Data belum siap ATAU Animasi belum selesai
    if (isLoading || !isSplashFinished || !navigationState?.key) return;

    const currentGroup = segments[0]; 
    const inAuthGroup = currentGroup === '(auth)';
    const inDashboardGroup = currentGroup === '(dashboard)';

    // SKENARIO A: User SUDAH Login
    if (user) {
      if (!inDashboardGroup) {
        router.replace('/(dashboard)/home');
      }
    } 
    // SKENARIO B: User BELUM Login
    else {
      if (!inAuthGroup) {
        router.replace('/(auth)/login');
      }
    }

  }, [user, isLoading, isSplashFinished, segments, navigationState?.key]);

  // 3. TAMPILKAN SPLASH SCREEN
  // Tampilkan jika: Data masih loading ATAU Animasi belum kelar
  if (isLoading || !isSplashFinished || !navigationState?.key) {
    return <AnimatedSplash />;
  }

  return <Slot />;
}

export default function RootLayout() {
  return (
    <AppController>
      <RootLayoutNav />
    </AppController>
  );
}