import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  X,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@/contexts/ThemeContext';
import Colors from '@/constants/colors';
interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description: string;
  date: string;
}

const CATEGORIES = {
  income: ['Salary', 'Freelance', 'Investment', 'Gift', 'Other'],
  expense: ['Food', 'Transport', 'Shopping', 'Entertainment', 'Bills', 'Health', 'Other'],
};

export default function MoneyTrackerScreen() {
  const { colors: themeColors } = useTheme();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES.expense[0]);

  React.useEffect(() => {
    void loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const stored = await AsyncStorage.getItem('@transactions');
      if (stored) {
        setTransactions(JSON.parse(stored));
      }
    } catch (error) {
      console.log('Error loading transactions:', error);
    }
  };
  
  // eslint-disable-next-line @typescript-eslint/no-floating-promises

  const saveTransactions = async (newTransactions: Transaction[]) => {
    try {
      await AsyncStorage.setItem('@transactions', JSON.stringify(newTransactions));
    } catch (error) {
      console.log('Error saving transactions:', error);
    }
  };
  
  // eslint-disable-next-line @typescript-eslint/no-floating-promises

  const handleAddTransaction = () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      amount: parseFloat(amount),
      type: activeTab,
      category: selectedCategory,
      description: description || selectedCategory,
      date: new Date().toISOString(),
    };

    const updated = [newTransaction, ...transactions];
    setTransactions(updated);
    void saveTransactions(updated);

    setAmount('');
    setDescription('');
    setShowAddModal(false);
  };

  const handleDeleteTransaction = (id: string) => {
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this transaction?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updated = transactions.filter(t => t.id !== id);
            setTransactions(updated);
            void saveTransactions(updated);
          },
        },
      ]
    );
  };

  const stats = useMemo(() => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    return {
      income,
      expense,
      balance: income - expense,
    };
  }, [transactions]);

  const recentTransactions = transactions.slice(0, 20);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerSubtitle}>MONEY TRACKER</Text>
            <Text style={styles.headerTitle}>Your Finances</Text>
          </View>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: themeColors.primary }]}
            onPress={() => setShowAddModal(true)}
            activeOpacity={0.8}
          >
            <Plus color={Colors.white} size={24} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Balance Card */}
        <View style={[styles.balanceCard, { backgroundColor: themeColors.primary }]}>
          <View style={styles.balanceHeader}>
            <View style={styles.balanceIconContainer}>
              <Wallet color={themeColors.primary} size={24} strokeWidth={2.5} />
            </View>
            <Text style={styles.balanceLabel}>Total Balance</Text>
          </View>
          <Text style={styles.balanceAmount}>{formatCurrency(stats.balance)}</Text>
          
          <View style={styles.balanceStats}>
            <View style={styles.balanceStat}>
              <View style={[styles.statIcon, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                <ArrowUpRight color={Colors.white} size={16} strokeWidth={2.5} />
              </View>
              <View>
                <Text style={styles.statLabel}>Income</Text>
                <Text style={styles.statValue}>{formatCurrency(stats.income)}</Text>
              </View>
            </View>
            <View style={styles.balanceStat}>
              <View style={[styles.statIcon, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                <ArrowDownRight color={Colors.white} size={16} strokeWidth={2.5} />
              </View>
              <View>
                <Text style={styles.statLabel}>Expense</Text>
                <Text style={styles.statValue}>{formatCurrency(stats.expense)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.transactionsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            {transactions.length > 0 && (
              <TouchableOpacity>
                <Text style={[styles.seeAll, { color: themeColors.primary }]}>See All</Text>
              </TouchableOpacity>
            )}
          </View>

          {recentTransactions.length > 0 ? (
            <View style={styles.transactionsList}>
              {recentTransactions.map((transaction, index) => (
                <TouchableOpacity
                  key={transaction.id}
                  style={[
                    styles.transactionItem,
                    index === recentTransactions.length - 1 && styles.transactionItemLast,
                  ]}
                  onLongPress={() => handleDeleteTransaction(transaction.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.transactionLeft}>
                    <View style={[
                      styles.transactionIcon,
                      { 
                        backgroundColor: transaction.type === 'income' 
                          ? `${Colors.success}15` 
                          : `${themeColors.primary}15`,
                      },
                    ]}>
                      {transaction.type === 'income' ? (
                        <TrendingUp color={Colors.success} size={20} strokeWidth={2.5} />
                      ) : (
                        <TrendingDown color={themeColors.primary} size={20} strokeWidth={2.5} />
                      )}
                    </View>
                    <View>
                      <Text style={styles.transactionDescription}>
                        {transaction.description}
                      </Text>
                      <Text style={styles.transactionCategory}>
                        {transaction.category}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.transactionRight}>
                    <Text style={[
                      styles.transactionAmount,
                      transaction.type === 'income' && styles.incomeAmount,
                    ]}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </Text>
                    <Text style={styles.transactionDate}>
                      {formatDate(transaction.date)}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <View style={[styles.emptyIcon, { backgroundColor: `${themeColors.primary}15` }]}>
                <Wallet color={themeColors.primary} size={32} strokeWidth={2} />
              </View>
              <Text style={styles.emptyTitle}>No transactions yet</Text>
              <Text style={styles.emptySubtitle}>
                Tap the + button to add your first transaction
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add Transaction Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Transaction</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowAddModal(false)}
              >
                <X color={Colors.textSecondary} size={24} strokeWidth={2.5} />
              </TouchableOpacity>
            </View>

            {/* Tabs */}
            <View style={styles.tabs}>
              <TouchableOpacity
                style={[
                  styles.tab,
                  activeTab === 'expense' && [styles.tabActive, { backgroundColor: themeColors.primary }],
                ]}
                onPress={() => {
                  setActiveTab('expense');
                  setSelectedCategory(CATEGORIES.expense[0]);
                }}
              >
                <Text style={[
                  styles.tabText,
                  activeTab === 'expense' && styles.tabTextActive,
                ]}>
                  Expense
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tab,
                  activeTab === 'income' && [styles.tabActive, { backgroundColor: Colors.success }],
                ]}
                onPress={() => {
                  setActiveTab('income');
                  setSelectedCategory(CATEGORIES.income[0]);
                }}
              >
                <Text style={[
                  styles.tabText,
                  activeTab === 'income' && styles.tabTextActive,
                ]}>
                  Income
                </Text>
              </TouchableOpacity>
            </View>

            {/* Amount Input */}
            <View style={styles.amountInputContainer}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={setAmount}
                placeholder="0"
                keyboardType="decimal-pad"
                placeholderTextColor={Colors.textTertiary}
                autoFocus
              />
            </View>

            {/* Category Selection */}
            <View style={styles.categorySection}>
              <Text style={styles.categoryLabel}>Category</Text>
              <View style={styles.categoryGrid}>
                {CATEGORIES[activeTab].map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryChip,
                      selectedCategory === category && [
                        styles.categoryChipActive,
                        { 
                          backgroundColor: activeTab === 'income' ? Colors.success : themeColors.primary,
                        },
                      ],
                    ]}
                    onPress={() => setSelectedCategory(category)}
                  >
                    <Text style={[
                      styles.categoryChipText,
                      selectedCategory === category && styles.categoryChipTextActive,
                    ]}>
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Description Input */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Description (Optional)</Text>
              <TextInput
                style={styles.textInput}
                value={description}
                onChangeText={setDescription}
                placeholder="Enter description..."
                placeholderTextColor={Colors.textTertiary}
              />
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={[
                styles.saveButton,
                { backgroundColor: activeTab === 'income' ? Colors.success : themeColors.primary },
              ]}
              onPress={handleAddTransaction}
              activeOpacity={0.8}
            >
              <Text style={styles.saveButtonText}>Add Transaction</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeArea: {
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  balanceCard: {
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 24,
    borderRadius: 24,
    padding: 24,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  balanceIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
  },
  balanceAmount: {
    fontSize: 40,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 24,
  },
  balanceStats: {
    flexDirection: 'row',
    gap: 24,
  },
  balanceStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
  transactionsSection: {
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
  },
  transactionsList: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    overflow: 'hidden',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  transactionItemLast: {
    borderBottomWidth: 0,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  transactionCategory: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  incomeAmount: {
    color: Colors.success,
  },
  transactionDate: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textTertiary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabs: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  tabActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.white,
    fontWeight: '700',
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  currencySymbol: {
    fontSize: 48,
    fontWeight: '600',
    color: Colors.text,
    marginRight: 8,
  },
  amountInput: {
    fontSize: 48,
    fontWeight: '700',
    color: Colors.text,
    minWidth: 120,
    textAlign: 'center',
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  categoryChipActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  categoryChipTextActive: {
    color: Colors.white,
    fontWeight: '700',
  },
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  saveButton: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  saveButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.white,
  },
});
