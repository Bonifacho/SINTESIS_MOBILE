import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/src/theme/colors';
import * as SecureStore from 'expo-secure-store';
import Toast from 'react-native-toast-message';

const STORE_KEY = 'sintesis_notifications_prefs';

export default function NotificationsConfigScreen() {
  const router = useRouter();

  const [prefs, setPrefs] = useState({
    announcements: true,
    evaluations: true,
    messages: true,
    reminders: false,
    dnd: false,
  });

  useEffect(() => {
    const loadPrefs = async () => {
      try {
        const stored = await SecureStore.getItemAsync(STORE_KEY);
        if (stored) {
          setPrefs(JSON.parse(stored));
        }
      } catch (e) {
        console.error('Error loading notification preferences', e);
      }
    };
    loadPrefs();
  }, []);

  const togglePref = async (key: keyof typeof prefs) => {
    const newPrefs = { ...prefs, [key]: !prefs[key] };
    setPrefs(newPrefs);
    try {
      await SecureStore.setItemAsync(STORE_KEY, JSON.stringify(newPrefs));
      Toast.show({
        type: 'success',
        text1: 'Preferencias guardadas',
        text2: 'Tus ajustes han sido actualizados.',
        position: 'bottom',
      });
    } catch (e) {
      console.error('Error saving notification preferences', e);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudieron guardar las preferencias.',
        position: 'bottom',
      });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={Colors.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notificaciones</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.subtitle}>
          Elige qué avisos quieres recibir en tu dispositivo.
        </Text>

        <View style={styles.card}>
          {/* Anuncios generales */}
          <View style={styles.row}>
            <View style={styles.iconContainer}>
              <Ionicons name="megaphone-outline" size={22} color={Colors.dark} />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.title}>Anuncios generales</Text>
              <Text style={styles.description}>Comunicados importantes de la institución</Text>
            </View>
            <Switch
              value={prefs.announcements}
              onValueChange={() => togglePref('announcements')}
              trackColor={{ false: Colors.window, true: Colors.primary }}
              thumbColor="#fff"
            />
          </View>
          <View style={styles.divider} />

          {/* Nuevas evaluaciones */}
          <View style={styles.row}>
            <View style={styles.iconContainer}>
              <Ionicons name="book-outline" size={22} color={Colors.dark} />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.title}>Nuevas evaluaciones</Text>
              <Text style={styles.description}>Avisos cuando se publica un examen o tarea</Text>
            </View>
            <Switch
              value={prefs.evaluations}
              onValueChange={() => togglePref('evaluations')}
              trackColor={{ false: Colors.window, true: Colors.primary }}
              thumbColor="#fff"
            />
          </View>
          <View style={styles.divider} />

          {/* Mensajes de docentes */}
          <View style={styles.row}>
            <View style={styles.iconContainer}>
              <Ionicons name="chatbubble-outline" size={22} color={Colors.dark} />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.title}>Mensajes de docentes</Text>
              <Text style={styles.description}>Respuestas y comentarios en tus actividades</Text>
            </View>
            <Switch
              value={prefs.messages}
              onValueChange={() => togglePref('messages')}
              trackColor={{ false: Colors.window, true: Colors.primary }}
              thumbColor="#fff"
            />
          </View>
          <View style={styles.divider} />

          {/* Recordatorios */}
          <View style={styles.row}>
            <View style={styles.iconContainer}>
              <Ionicons name="notifications-outline" size={22} color={Colors.dark} />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.title}>Recordatorios</Text>
              <Text style={styles.description}>Alertas antes de la fecha límite</Text>
            </View>
            <Switch
              value={prefs.reminders}
              onValueChange={() => togglePref('reminders')}
              trackColor={{ false: Colors.window, true: Colors.primary }}
              thumbColor="#fff"
            />
          </View>
          <View style={styles.divider} />

          {/* Modo no molestar */}
          <View style={styles.row}>
            <View style={styles.iconContainer}>
              <Ionicons name="moon-outline" size={22} color={Colors.dark} />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.title}>Modo no molestar</Text>
              <Text style={styles.description}>Silenciar notificaciones de 10pm a 6am</Text>
            </View>
            <Switch
              value={prefs.dnd}
              onValueChange={() => togglePref('dnd')}
              trackColor={{ false: Colors.window, true: Colors.primary }}
              thumbColor="#fff"
            />
          </View>
        </View>

        <Text style={styles.footerText}>
          Puedes cambiar estas preferencias en cualquier momento.
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
  content: { padding: 20 },
  subtitle: { fontSize: 14, color: Colors.gray, marginBottom: 20, paddingHorizontal: 4 },
  card: { 
    backgroundColor: Colors.surface, borderRadius: 20, 
    borderWidth: 1, borderColor: Colors.window, overflow: 'hidden',
  },
  row: { 
    flexDirection: 'row', alignItems: 'center', 
    paddingVertical: 16, paddingHorizontal: 16, gap: 12,
  },
  iconContainer: { 
    width: 40, height: 40, borderRadius: 12, 
    backgroundColor: Colors.background, 
    justifyContent: 'center', alignItems: 'center' 
  },
  textContainer: { flex: 1 },
  title: { fontSize: 15, fontWeight: '700', color: Colors.dark, marginBottom: 2 },
  description: { fontSize: 12, color: Colors.gray, lineHeight: 16 },
  divider: { height: 1, backgroundColor: Colors.window, marginLeft: 68 },
  footerText: { 
    textAlign: 'center', fontSize: 12, color: Colors.gray, 
    marginTop: 24, paddingHorizontal: 20 
  },
});
