import { Link, Stack } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Home } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useTheme } from '@/contexts/ThemeContext';

export default function NotFoundScreen() {
  const { colors: themeColors } = useTheme();

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Page Not Found' }} />
      
      <View style={[styles.iconContainer, { backgroundColor: `${themeColors.primary}15` }]}>
        <Text style={[styles.emoji, { color: themeColors.primary }]}>🤔</Text>
      </View>
      
      <Text style={styles.title}>Page Not Found</Text>
      <Text style={styles.description}>
        The page you are looking for doesn&apos;t exist or has been moved.
      </Text>

      <Link href="/(tabs)" asChild>
        <TouchableOpacity style={[styles.button, { backgroundColor: themeColors.primary }]}>
          <Home color={Colors.white} size={20} strokeWidth={2.5} />
          <Text style={styles.buttonText}>Go Home</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emoji: {
    fontSize: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    maxWidth: 280,
    lineHeight: 24,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
});
