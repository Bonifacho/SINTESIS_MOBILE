import { View, Text } from 'react-native';
import { Colors } from '@/src/theme/colors';

export default function TeacherResults() {
  return (
    <View style={{ flex: 1, justifyContent: 'center',
      alignItems: 'center', backgroundColor: Colors.background }}>
      <Text style={{ color: Colors.dark, fontSize: 18,
        fontWeight: '600' }}>Resultados por grupo</Text>
    </View>
  );
}