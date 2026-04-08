import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '@/src/theme/colors';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function OvasScreen() {
  // Atrapamos los parámetros que enviaremos desde la pantalla de Materias
  const { name } = useLocalSearchParams();
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Encabezado con Botón de Retroceso */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color={Colors.primary} />
          <Text style={styles.backText}>Volver a Materias</Text>
        </TouchableOpacity>
        
        <Text style={styles.title}>Material de Estudio</Text>
        <Text style={styles.subtitle}>
          {name ? `Asignatura: ${name}` : 'Cargando asignatura...'}
        </Text>
      </View>

      {/* Cascarón limpio */}
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Buscando Objetos Virtuales de Aprendizaje (OVAs)...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: 24,
    paddingTop: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.window,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
    marginLeft: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.gray,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: Colors.gray,
    fontStyle: 'italic',
  },
});