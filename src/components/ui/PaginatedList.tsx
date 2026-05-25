// src/components/ui/PaginatedList.tsx
// Componente reutilizable de paginación client-side (Rúbrica §6)
// Divide un array de datos en páginas y renderiza controles de navegación.

import React, { useMemo, useState, useCallback } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
  type ListRenderItem,
} from 'react-native';
import { Colors } from '@/src/theme/colors';
import { Ionicons } from '@expo/vector-icons';

interface PaginatedListProps<T> {
  /** Array completo de datos (la paginación se hace en el cliente) */
  data: T[];
  /** Función para renderizar cada item */
  renderItem: ListRenderItem<T>;
  /** Función para extraer la key de cada item */
  keyExtractor: (item: T, index: number) => string;
  /** Items por página (default: 10) */
  pageSize?: number;
  /** Componente a mostrar cuando no hay datos */
  ListEmptyComponent?: React.ComponentType | React.ReactElement;
  /** Componente a mostrar antes de la lista */
  ListHeaderComponent?: React.ComponentType | React.ReactElement;
  /** Estilo adicional del contenedor de la lista */
  contentContainerStyle?: object;
  /** Booleano para el estado de refresco (Pull-to-refresh) */
  refreshing?: boolean;
  /** Función que se ejecuta al arrastrar hacia abajo para refrescar */
  onRefresh?: () => void;
}

export default function PaginatedList<T>({
  data,
  renderItem,
  keyExtractor,
  pageSize = 10,
  ListEmptyComponent,
  ListHeaderComponent,
  contentContainerStyle,
  refreshing = false,
  onRefresh,
}: PaginatedListProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(data.length / pageSize)),
    [data.length, pageSize]
  );

  // Slice de datos para la página actual
  const pageData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, currentPage, pageSize]);

  // Reset a página 1 cuando cambian los datos
  React.useEffect(() => {
    setCurrentPage(1);
  }, [data.length]);

  const goToPrev = useCallback(() => {
    setCurrentPage((p) => Math.max(1, p - 1));
  }, []);

  const goToNext = useCallback(() => {
    setCurrentPage((p) => Math.min(totalPages, p + 1));
  }, [totalPages]);

  // Si no hay datos, solo mostrar el EmptyComponent
  if (data.length === 0) {
    return (
      <FlatList
        style={{ flex: 1 }}
        data={[]}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListEmptyComponent={ListEmptyComponent}
        ListHeaderComponent={ListHeaderComponent}
        contentContainerStyle={contentContainerStyle}
        refreshControl={
          onRefresh ? (
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
          ) : undefined
        }
      />
    );
  }

  const renderFooter = () => {
    if (totalPages <= 1) return null;
    return (
      <View style={styles.paginationBar}>
        <TouchableOpacity
          style={[styles.pageBtn, currentPage === 1 && styles.pageBtnDisabled]}
          onPress={goToPrev}
          disabled={currentPage === 1}
        >
          <Ionicons
            name="chevron-back"
            size={18}
            color={currentPage === 1 ? Colors.window : Colors.primary}
          />
          <Text
            style={[
              styles.pageBtnText,
              currentPage === 1 && styles.pageBtnTextDisabled,
            ]}
          >
            Anterior
          </Text>
        </TouchableOpacity>

        <View style={styles.pageIndicator}>
          <Text style={styles.pageNumber}>{currentPage}</Text>
          <Text style={styles.pageTotal}> de {totalPages}</Text>
        </View>

        <TouchableOpacity
          style={[styles.pageBtn, currentPage === totalPages && styles.pageBtnDisabled]}
          onPress={goToNext}
          disabled={currentPage === totalPages}
        >
          <Text
            style={[
              styles.pageBtnText,
              currentPage === totalPages && styles.pageBtnTextDisabled,
            ]}
          >
            Siguiente
          </Text>
          <Ionicons
            name="chevron-forward"
            size={18}
            color={currentPage === totalPages ? Colors.window : Colors.primary}
          />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.wrapper}>
      <FlatList
        style={{ flex: 1 }}
        data={pageData}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={ListHeaderComponent}
        ListFooterComponent={renderFooter}
        contentContainerStyle={contentContainerStyle}
        showsVerticalScrollIndicator={false}
        refreshControl={
          onRefresh ? (
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
          ) : undefined
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  paginationBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 16,
  },
  pageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: Colors.primary + '10',
    gap: 4,
  },
  pageBtnDisabled: {
    backgroundColor: Colors.window + '50',
  },
  pageBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  pageBtnTextDisabled: {
    color: Colors.gray,
  },
  pageIndicator: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  pageNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
  },
  pageTotal: {
    fontSize: 13,
    color: Colors.gray,
    fontWeight: '500',
  },
});
