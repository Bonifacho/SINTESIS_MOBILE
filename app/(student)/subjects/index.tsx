import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/src/theme/colors';

export default function SubjectsScreen() {
  return (
    <View style={styles.container}>
      {/* Encabezado fijo */}
      <View style={styles.header}>
        <Text style={styles.title}>Mis Asignaturas</Text>
        <Text style={styles.subtitle}>Selecciona una materia para acceder a su contenido interactivo.</Text>
      </View>

      {/* Cascarón limpio: Aquí irá la FlatList cuando conectemos la DB */}
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Esperando datos del servidor...</Text>
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
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.window,
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