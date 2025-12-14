import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { 
  Inbox, 
  CheckCircle2, 
  Target, 
  FolderKanban, 
  BookOpen, 
  Trash2,
  LucideIcon
} from 'lucide-react-native';
import Colors from '@/constants/colors';

interface EmptyStateProps {
  icon?: 'inbox' | 'check' | 'target' | 'folder' | 'book' | 'trash';
  title: string;
  description?: string;
  iconColor?: string;
}

export default function EmptyState({ 
  icon = 'inbox', 
  title, 
  description,
  iconColor = Colors.textSecondary
}: EmptyStateProps) {
  const IconComponent = getIconComponent(icon);
  
  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { borderColor: iconColor + '20' }]}>
        <View style={[styles.iconInner, { backgroundColor: iconColor + '10' }]}>
          <IconComponent 
            color={iconColor} 
            size={48} 
            strokeWidth={1.5}
          />
        </View>
      </View>
      
      <Text style={styles.title}>{title}</Text>
      
      {description && (
        <Text style={styles.description}>{description}</Text>
      )}
    </View>
  );
}

function getIconComponent(icon: string): LucideIcon {
  switch (icon) {
    case 'check':
      return CheckCircle2;
    case 'target':
      return Target;
    case 'folder':
      return FolderKanban;
    case 'book':
      return BookOpen;
    case 'trash':
      return Trash2;
    case 'inbox':
    default:
      return Inbox;
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  iconInner: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  description: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
});
