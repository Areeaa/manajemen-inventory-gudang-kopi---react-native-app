import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function AnimatedSplash() {
  // Nilai Awal Animasi (Tipe otomatis terdeteksi sebagai Animated.Value)
  const fadeAnim = useRef(new Animated.Value(0)).current;  // Opacity awal 0
  const scaleAnim = useRef(new Animated.Value(0.8)).current; // Ukuran awal 80%
  const moveAnim = useRef(new Animated.Value(20)).current;   // Posisi y turun 20px

  useEffect(() => {
    // Jalankan Animasi secara Paralel (Bersamaan)
    Animated.parallel([
      // 1. Muncul perlahan
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000, // 1 detik
        useNativeDriver: true,
      }),
      // 2. Membesar (Scale Up)
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
      // 3. Naik ke atas (Slide Up)
      Animated.timing(moveAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Ikon Kopi Animasi */}
        <Animated.View style={{ 
          opacity: fadeAnim, 
          transform: [{ scale: scaleAnim }] 
        }}>
          <View style={styles.iconCircle}>
            <Ionicons name="cafe" size={60} color="#fff" />
          </View>
        </Animated.View>

        {/* Teks Judul Animasi */}
        <Animated.View style={{ 
          opacity: fadeAnim, 
          transform: [{ translateY: moveAnim }] 
        }}>
          <Text style={styles.title}>Gudang Kopi</Text>
          <Text style={styles.subtitle}>Sistem Manajemen Gudang</Text>
        </Animated.View>
      </View>

      {/* Footer / Copyright */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>LMDH Mekarsari Siremeng</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6F4E37', // Warna Kopi (Primary)
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 120,
    height: 120,
    backgroundColor: 'rgba(255,255,255,0.2)', // Lingkaran transparan
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 2,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#E0E0E0',
    marginTop: 5,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
  },
  footerText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
  }
});