import { View, Text } from 'react-native';
import { Colors } from '@/src/theme/colors';

export default function TeacherHome() {
  return (
    <View style={{ flex: 1, justifyContent: 'center',
      alignItems: 'center', backgroundColor: Colors.background }}>
      <Text style={{ color: Colors.dark, fontSize: 18,
        fontWeight: '600' }}>Vista rápida — Grupos</Text>
      <Text style={{ color: Colors.gray, marginTop: 8, fontSize: 13 }}>
        Solo lectura · Gestión completa en portal web
      </Text>
    </View>
  );
}