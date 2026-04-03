import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function PrimaryButton({ styles, title, loading, onPress }) {
  return (
    <TouchableOpacity style={styles.primaryBtn} onPress={onPress} disabled={loading} activeOpacity={0.9}>
      <View style={styles.primaryBtnGlow} />
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <View style={styles.primaryBtnRow}>
          <Ionicons name="arrow-forward-outline" size={18} color="#fff" />
          <Text style={styles.primaryBtnText}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
