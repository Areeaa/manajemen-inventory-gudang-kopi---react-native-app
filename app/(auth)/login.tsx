import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView, // 1. Import ini
  Platform,             // 2. Import ini untuk deteksi OS
  ScrollView            // 3. Import ini agar bisa di-scroll
} from 'react-native';
import { useController } from '../../src/controllers/AppController';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const { login, theme } = useController();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  return (
    // 4. Ganti View terluar dengan KeyboardAvoidingView
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: theme.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} // Logika agar jalan di iOS & Android
    >
      
      {/* 5. Tambahkan ScrollView agar konten bisa digeser jika layar sempit */}
      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        
        <View style={styles.header}>
          <Ionicons name="cafe" size={80} color={theme.primary} />
          <Text style={[styles.title, { color: theme.text }]}>Gudang Kopi</Text>
          <Text style={{ color: 'gray' }}>Sistem Manajemen Gudang</Text>
        </View>

        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <TextInput 
            placeholder="Username" 
            placeholderTextColor="gray" // Tambahan agar teks placeholder terlihat jelas
            style={[styles.input, { color: theme.text }]} // Tambahan agar input mengikuti tema
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
          <TextInput 
            placeholder="Password" 
            placeholderTextColor="gray"
            style={[styles.input, { color: theme.text }]}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          
          <TouchableOpacity 
            style={[styles.btn, { backgroundColor: theme.primary }]}
            onPress={() => login(username, password)}
          >
            <Text style={styles.btnText}>MASUK</Text>
          </TouchableOpacity>
          
          <Text style={{textAlign:'center', marginTop:15, color:'gray', fontSize:12}}>
            LMDH Mekarsari Siremeng
          </Text>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  // 6. Style baru untuk memastikan konten tetap di tengah saat keyboard tertutup
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20
  },
  header: { 
    alignItems: 'center', 
    marginBottom: 40 
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    marginTop: 10 
  },
  card: { 
    padding: 20, 
    borderRadius: 15, 
    elevation: 5 
  },
  input: { 
    borderWidth: 1, 
    borderColor: '#ddd', 
    padding: 15, 
    borderRadius: 8, 
    marginBottom: 15, 
    backgroundColor: '#f9f9f9' 
  },
  btn: { 
    padding: 15, 
    borderRadius: 8, 
    alignItems: 'center' 
  },
  btnText: { 
    color: '#fff', 
    fontWeight: 'bold' 
  }
});