import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface StatCardProps {
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  label: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
  onPress?: () => void;
}

export default function StatCard({ 
  icon: Icon, 
  iconColor, 
  iconBg,
  label, 
  value, 
  trend,
  trendUp,
  onPress 
}: StatCardProps) {
  const Wrapper = onPress ? TouchableOpacity : View;
  
  return (
    <Wrapper 
      style={styles.container}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
        <Icon color={iconColor} size={24} strokeWidth={2.5} fill="none" />
      </View>
      
      <View style={styles.content}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.valueRow}>
          <Text style={styles.value}>{value}</Text>
          {trend && (
            <Text style={[
              styles.trend, 
              { color: trendUp ? '#10B981' : '#EF4444' }
            ]}>
              {trend}
            </Text>
          )}
        </View>
      </View>
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 16,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  content: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  value: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.text,
  },
  trend: {
    fontSize: 14,
    fontWeight: '700',
  },
});
