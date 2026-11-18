import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '@/constants/theme';

export function ItemHeader() {
  return <View style={styles.header}>
    <Pressable
      onPress={() => {
        if (router.canGoBack()) router.back();
        else router.replace('/app/tabs/items');
      }}
      accessibilityRole="button"
      accessibilityLabel="Close item details"
      hitSlop={10}
      style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
    >
      <Ionicons name="close" size={21} color={colors.text} />
    </Pressable>
  </View>;
}

const styles = StyleSheet.create({
  header: { marginBottom: spacing.lg },
  backButton: { width: 40, height: 40, alignSelf: 'flex-start', alignItems: 'center', justifyContent: 'center', borderRadius: 999, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  pressed: { opacity: 0.7 },
});
