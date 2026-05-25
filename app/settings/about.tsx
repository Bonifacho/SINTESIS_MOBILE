import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/src/theme/colors';

export default function AboutScreen() {
  const router = useRouter();

  const handleOpenLink = (url: string) => {
    Linking.openURL(url).catch(err => console.error('Error opening link:', err));
  };

  const handleSupport = () => {
    Linking.openURL('mailto:soporte@sintesis.edu?subject=Soporte App Movil Sintesis').catch(err => 
      console.error('Error opening mailto:', err)
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={Colors.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Información de la app</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* App Info Card */}
        <View style={styles.heroCard}>
          <View style={styles.logoContainer}>
            <Ionicons name="information" size={32} color={Colors.primary} />
          </View>
          <Text style={styles.appName}>SÍNTESIS</Text>
          <Text style={styles.appDescription}>
            Plataforma educativa para estudiantes, docentes y practicantes.
          </Text>
        </View>

        {/* Version Info Card */}
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Versión</Text>
            <Text style={styles.rowValue}>1.0.0</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Build</Text>
            <Text style={styles.rowValue}>2026.05.18</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Plataforma</Text>
            <Text style={styles.rowValue}>Mobile · iOS / Android</Text>
          </View>
        </View>

        {/* Links Card */}
        <View style={styles.card}>
          <TouchableOpacity style={styles.linkRow} onPress={() => handleOpenLink('https://sintesis.edu')}>
            <Ionicons name="globe-outline" size={20} color={Colors.gray} />
            <View style={styles.linkTextContainer}>
              <Text style={styles.linkLabel}>Sitio web</Text>
              <Text style={styles.linkSub}>sintesis.edu</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.window} />
          </TouchableOpacity>
          <View style={styles.divider} />

          <TouchableOpacity style={styles.linkRow} onPress={handleSupport}>
            <Ionicons name="mail-outline" size={20} color={Colors.gray} />
            <View style={styles.linkTextContainer}>
              <Text style={styles.linkLabel}>Soporte</Text>
              <Text style={styles.linkSub}>soporte@sintesis.edu</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.window} />
          </TouchableOpacity>
          <View style={styles.divider} />

          <TouchableOpacity style={styles.linkRow} onPress={() => handleOpenLink('https://sintesis.edu/privacy')}>
            <Ionicons name="shield-checkmark-outline" size={20} color={Colors.gray} />
            <View style={styles.linkTextContainer}>
              <Text style={styles.linkLabel}>Política de privacidad</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.window} />
          </TouchableOpacity>
          <View style={styles.divider} />

          <TouchableOpacity style={styles.linkRow} onPress={() => handleOpenLink('https://sintesis.edu/terms')}>
            <Ionicons name="document-text-outline" size={20} color={Colors.gray} />
            <View style={styles.linkTextContainer}>
              <Text style={styles.linkLabel}>Términos y condiciones</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.window} />
          </TouchableOpacity>
          <View style={styles.divider} />

          <TouchableOpacity style={styles.linkRow} onPress={() => handleOpenLink('https://sintesis.edu/opensource')}>
            <Ionicons name="code-slash-outline" size={20} color={Colors.gray} />
            <View style={styles.linkTextContainer}>
              <Text style={styles.linkLabel}>Licencias open source</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.window} />
          </TouchableOpacity>
        </View>

        <Text style={styles.footerText}>
          © 2026 SÍNTESIS · Todos los derechos reservados
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { 
    flexDirection: 'row', alignItems: 'center', 
    paddingTop: 48, paddingHorizontal: 16, paddingBottom: 16,
    backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.window 
  },
  backButton: { marginRight: 16 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: Colors.dark },
  content: { padding: 16, paddingBottom: 40, gap: 16 },
  
  heroCard: {
    backgroundColor: Colors.surface, borderRadius: 24,
    borderWidth: 1, borderColor: Colors.window,
    padding: 32, alignItems: 'center',
  },
  logoContainer: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 16,
  },
  appName: { fontSize: 24, fontWeight: '800', color: Colors.dark, marginBottom: 8 },
  appDescription: { fontSize: 14, color: Colors.gray, textAlign: 'center', lineHeight: 20 },
  
  card: { 
    backgroundColor: Colors.surface, borderRadius: 20, 
    borderWidth: 1, borderColor: Colors.window, overflow: 'hidden',
  },
  
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18 },
  rowLabel: { fontSize: 15, color: Colors.gray },
  rowValue: { fontSize: 15, fontWeight: '600', color: Colors.dark },
  
  linkRow: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 16 },
  linkTextContainer: { flex: 1, justifyContent: 'center' },
  linkLabel: { fontSize: 15, fontWeight: '600', color: Colors.dark },
  linkSub: { fontSize: 13, color: Colors.gray, marginTop: 2 },
  
  divider: { height: 1, backgroundColor: Colors.window, marginHorizontal: 16 },
  
  footerText: { 
    textAlign: 'center', fontSize: 12, color: Colors.gray, 
    marginTop: 16, fontWeight: '500' 
  },
});
