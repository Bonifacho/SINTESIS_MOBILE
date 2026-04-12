// src/components/ui/searchableSelect.tsx
import { Colors } from '@/src/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Option {
  id: number;
  description: string;
}

interface SearchableSelectProps {
  data: Option[];
  value: number;
  onSelect: (id: number) => void;
  placeholder: string;
  isLoading?: boolean;
}

export default function SearchableSelect({ data, value, onSelect, placeholder, isLoading = false }: SearchableSelectProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');

  const selectedItem = data.find(item => item.id === value);

  const filteredData = useMemo(() => {
    if (!searchText) return data;
    return data.filter(item => item.description.toLowerCase().includes(searchText.toLowerCase()));
  }, [data, searchText]);

  const handleSelect = (id: number) => {
    onSelect(id);
    setModalVisible(false);
    setSearchText('');
  };

  return (
    <View>
      <TouchableOpacity style={styles.selector} onPress={() => setModalVisible(true)} disabled={isLoading}>
        {isLoading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="small" color={Colors.primary} />
            <Text style={[styles.placeholder, { marginLeft: 10 }]}>Cargando...</Text>
          </View>
        ) : (
          <>
            <Text style={selectedItem ? styles.selectedText : styles.placeholder}>
              {selectedItem ? selectedItem.description : placeholder}
            </Text>
            <Ionicons name="chevron-down" size={20} color={Colors.gray} />
          </>
        )}
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Seleccionar opción</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={Colors.dark} />
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={Colors.gray} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar..."
              placeholderTextColor={Colors.gray}
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>

          <FlatList
            data={filteredData}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.itemRow} onPress={() => handleSelect(item.id)}>
                <Text style={styles.itemText}>{item.description}</Text>
                {item.id === value && <Ionicons name="checkmark" size={20} color={Colors.primary} />}
              </TouchableOpacity>
            )}
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  selector: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.window, padding: 15, borderRadius: 10, justifyContent: 'space-between' },
  placeholder: { color: Colors.gray, fontSize: 16, flex: 1 },
  selectedText: { color: Colors.dark, fontSize: 16, flex: 1 },
  loaderContainer: { flexDirection: 'row', alignItems: 'center' },
  modalContainer: { flex: 1, backgroundColor: Colors.surface },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: Colors.window },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.dark },
  closeButton: { padding: 5 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.background, margin: 15, paddingHorizontal: 15, borderRadius: 10, height: 45 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16, color: Colors.dark },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, borderBottomWidth: 1, borderBottomColor: Colors.background },
  itemText: { fontSize: 16, color: Colors.dark },
});