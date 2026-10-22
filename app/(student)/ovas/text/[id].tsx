// app/(student)/ovas/text/[id].tsx
// Visor de Recursos de Texto Enriquecido (MOV-06)
// Soporta renderizado de texto con formato, control de tipografía,
// modo oscuro/claro y tracking silencioso de lectura.

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/src/theme/colors';
import { useThemeStore } from '@/src/store/themeStore';
import { useAuthStore } from '@/src/store/authStore';
import { academicApi } from '@/src/api/academic';
import { goBackOrTo } from '@/src/utils/navigation';

export default function TextResourceViewer() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id: string;
    title?: string;
    content?: string;
    topicTitle?: string;
  }>();

  const isDark = useThemeStore((s) => s.isDark);
  const user = useAuthStore((s) => s.user);
  const styles = makeStyles(isDark);

  const [fontSize, setFontSize] = useState<number>(16);

  const ovaId = Number(params.id);
  const resourceTitle = params.title || 'Recurso de Lectura';
  const topicTitle = params.topicTitle || 'Tema';
  const rawContent = params.content || 'Sin contenido de texto disponible para este recurso.';

  // Tracking silencioso al abrir la lectura
  useEffect(() => {
    if (user?.id && ovaId) {
      academicApi.trackProgress(
        user.id,
        ovaId,
        'resource_opened',
        { topic_name: topicTitle, resource_name: resourceTitle }
      ).catch((err) => console.error('[Tracking] Error al registrar lectura:', err));
    }
  }, [user?.id, ovaId, topicTitle, resourceTitle]);

  // Cálculo de tiempo estimado de lectura (200 palabras por minuto)
  const wordCount = rawContent.trim().split(/\s+/).filter(Boolean).length;
  const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  const increaseFontSize = () => setFontSize((prev) => Math.min(prev + 2, 24));
  const decreaseFontSize = () => setFontSize((prev) => Math.max(prev - 2, 13));

  // Renderizado formateado de párrafos
  const renderFormattedParagraphs = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) {
        return <View key={idx} style={{ height: 12 }} />;
      }

      // Encabezado nivel 1
      if (trimmed.startsWith('# ')) {
        return (
          <Text key={idx} style={[styles.heading1, { fontSize: fontSize + 6 }]}>
            {trimmed.replace('# ', '')}
          </Text>
        );
      }
      // Encabezado nivel 2
      if (trimmed.startsWith('## ')) {
        return (
          <Text key={idx} style={[styles.heading2, { fontSize: fontSize + 4 }]}>
            {trimmed.replace('## ', '')}
          </Text>
        );
      }
      // Encabezado nivel 3
      if (trimmed.startsWith('### ')) {
        return (
          <Text key={idx} style={[styles.heading3, { fontSize: fontSize + 2 }]}>
            {trimmed.replace('### ', '')}
          </Text>
        );
      }
      // Viñetas / Listas
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        return (
          <View key={idx} style={styles.bulletItem}>
            <Text style={[styles.bulletDot, { fontSize }]}>•</Text>
            <Text style={[styles.bulletText, { fontSize }]}>
              {trimmed.substring(2)}
            </Text>
          </View>
        );
      }
      // Cita / Bloque destacado
      if (trimmed.startsWith('> ')) {
        return (
          <View key={idx} style={styles.quoteBlock}>
            <Text style={[styles.quoteText, { fontSize: fontSize - 1 }]}>
              {trimmed.substring(2)}
            </Text>
          </View>
        );
      }

      // Párrafo estándar
      return (
        <Text key={idx} style={[styles.paragraph, { fontSize, lineHeight: fontSize * 1.6 }]}>
          {trimmed}
        </Text>
      );
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Barra superior / Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => goBackOrTo(router, '/(student)/subjects')}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color={isDark ? '#FFF' : Colors.primary} />
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>

        {/* Controles de lectura (zoom tipográfico) */}
        <View style={styles.controlsRow}>
          <TouchableOpacity
            style={styles.controlBtn}
            onPress={decreaseFontSize}
            disabled={fontSize <= 13}
            activeOpacity={0.7}
          >
            <Text style={[styles.controlBtnText, fontSize <= 13 && styles.controlBtnDisabled]}>
              A-
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.controlBtn}
            onPress={increaseFontSize}
            disabled={fontSize >= 24}
            activeOpacity={0.7}
          >
            <Text style={[styles.controlBtnText, fontSize >= 24 && styles.controlBtnDisabled]}>
              A+
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Contenido de la lectura */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Metadatos y Encabezado de la Lectura */}
        <View style={styles.metaContainer}>
          <View style={styles.badgeRow}>
            <View style={styles.topicBadge}>
              <Text style={styles.topicBadgeText}>{topicTitle}</Text>
            </View>
            <View style={styles.timeBadge}>
              <Ionicons name="time-outline" size={13} color={Colors.primary} style={{ marginRight: 4 }} />
              <Text style={styles.timeBadgeText}>{readTimeMinutes} min de lectura</Text>
            </View>
          </View>

          <Text style={styles.articleTitle}>{resourceTitle}</Text>
        </View>

        <View style={styles.divider} />

        {/* Cuerpo del recurso */}
        <View style={styles.bodyContainer}>
          {renderFormattedParagraphs(rawContent)}
        </View>

        {/* Cierre de lectura */}
        <View style={styles.footer}>
          <View style={styles.checkIconBox}>
            <Ionicons name="checkmark-circle" size={32} color={Colors.success} />
          </View>
          <Text style={styles.footerTitle}>¡Lectura completada!</Text>
          <Text style={styles.footerSubtitle}>
            Tu progreso en este recurso ha sido registrado en la plataforma.
          </Text>

          <TouchableOpacity
            style={styles.finishButton}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Text style={styles.finishButtonText}>Regresar al OVA</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (isDark: boolean) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: isDark ? '#121212' : '#F8FAFC',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#262626' : '#E2E8F0',
      backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    backButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: isDark ? '#FFF' : Colors.primary,
      marginLeft: 4,
    },
    controlsRow: {
      flexDirection: 'row',
      gap: 8,
    },
    controlBtn: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      backgroundColor: isDark ? '#2D2D2D' : '#F1F5F9',
      borderWidth: 1,
      borderColor: isDark ? '#3D3D3D' : '#CBD5E1',
    },
    controlBtnText: {
      fontSize: 14,
      fontWeight: '700',
      color: isDark ? '#E2E8F0' : Colors.dark,
    },
    controlBtnDisabled: {
      opacity: 0.35,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: 20,
      paddingBottom: 40,
    },
    metaContainer: {
      marginBottom: 16,
    },
    badgeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 12,
      flexWrap: 'wrap',
    },
    topicBadge: {
      backgroundColor: isDark ? '#1E3A5F' : '#EFF6FF',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: isDark ? '#2563EB' : '#BFDBFE',
    },
    topicBadgeText: {
      fontSize: 12,
      fontWeight: '600',
      color: isDark ? '#93C5FD' : '#1D4ED8',
    },
    timeBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? '#262626' : '#F1F5F9',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 6,
    },
    timeBadgeText: {
      fontSize: 12,
      fontWeight: '500',
      color: isDark ? '#A3A3A3' : '#64748B',
    },
    articleTitle: {
      fontSize: 24,
      fontWeight: '800',
      color: isDark ? '#F8FAFC' : '#0F172A',
      lineHeight: 32,
    },
    divider: {
      height: 1,
      backgroundColor: isDark ? '#262626' : '#E2E8F0',
      marginBottom: 20,
    },
    bodyContainer: {
      marginBottom: 32,
    },
    heading1: {
      fontWeight: '800',
      color: isDark ? '#F1F5F9' : '#0F172A',
      marginTop: 20,
      marginBottom: 10,
    },
    heading2: {
      fontWeight: '700',
      color: isDark ? '#E2E8F0' : '#1E293B',
      marginTop: 16,
      marginBottom: 8,
    },
    heading3: {
      fontWeight: '600',
      color: isDark ? '#CBD5E1' : '#334155',
      marginTop: 12,
      marginBottom: 6,
    },
    paragraph: {
      color: isDark ? '#D1D5DB' : '#334155',
      marginBottom: 14,
    },
    bulletItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 8,
      paddingLeft: 6,
    },
    bulletDot: {
      color: Colors.primary,
      marginRight: 8,
      lineHeight: 24,
    },
    bulletText: {
      flex: 1,
      color: isDark ? '#D1D5DB' : '#334155',
      lineHeight: 24,
    },
    quoteBlock: {
      borderLeftWidth: 4,
      borderLeftColor: Colors.primary,
      backgroundColor: isDark ? '#1C2433' : '#F0F9FF',
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 6,
      marginVertical: 12,
    },
    quoteText: {
      fontStyle: 'italic',
      color: isDark ? '#93C5FD' : '#0369A1',
      lineHeight: 22,
    },
    footer: {
      alignItems: 'center',
      backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
      borderRadius: 16,
      padding: 24,
      borderWidth: 1,
      borderColor: isDark ? '#262626' : '#E2E8F0',
      marginTop: 16,
    },
    checkIconBox: {
      marginBottom: 8,
    },
    footerTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: isDark ? '#FFF' : '#0F172A',
      marginBottom: 6,
    },
    footerSubtitle: {
      fontSize: 14,
      color: isDark ? '#A3A3A3' : '#64748B',
      textAlign: 'center',
      marginBottom: 18,
      lineHeight: 20,
    },
    finishButton: {
      backgroundColor: Colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 12,
      width: '100%',
      alignItems: 'center',
    },
    finishButtonText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '700',
    },
  });
