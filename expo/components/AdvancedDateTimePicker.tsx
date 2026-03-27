import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronDown, ArrowLeft } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useTheme } from '@/contexts/ThemeContext';

interface AdvancedDateTimePickerProps {
  visible: boolean;
  mode: 'date' | 'time';
  value: Date;
  onConfirm: (date: Date) => void;
  onCancel: () => void;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS_OF_WEEK = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

export default function AdvancedDateTimePicker({
  visible,
  mode,
  value,
  onConfirm,
  onCancel,
}: AdvancedDateTimePickerProps) {
  const { colors: themeColors } = useTheme();
  const [selectedDate, setSelectedDate] = useState(value);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);

  const [displayMonth, setDisplayMonth] = useState(value.getMonth());
  const [displayYear, setDisplayYear] = useState(value.getFullYear());
  
  const [hour, setHour] = useState(value.getHours());
  const [minute, setMinute] = useState(value.getMinutes());

  useEffect(() => {
    if (visible) {
      setSelectedDate(value);
      setDisplayMonth(value.getMonth());
      setDisplayYear(value.getFullYear());
      setHour(value.getHours());
      setMinute(value.getMinutes());
      setShowMonthPicker(false);
      setShowYearPicker(false);
    }
  }, [visible, value]);

  const handleConfirm = () => {
    onConfirm(selectedDate);
  };

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(displayMonth, displayYear);
    const firstDay = getFirstDayOfMonth(displayMonth, displayYear);
    const prevMonthDays = getDaysInMonth(displayMonth - 1, displayYear);

    const days: { day: number; isCurrentMonth: boolean; date: Date }[] = [];

    for (let i = firstDay - 1; i >= 0; i--) {
      const prevMonth = displayMonth === 0 ? 11 : displayMonth - 1;
      const prevYear = displayMonth === 0 ? displayYear - 1 : displayYear;
      days.push({
        day: prevMonthDays - i,
        isCurrentMonth: false,
        date: new Date(prevYear, prevMonth, prevMonthDays - i),
      });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        day,
        isCurrentMonth: true,
        date: new Date(displayYear, displayMonth, day),
      });
    }

    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const nextMonth = displayMonth === 11 ? 0 : displayMonth + 1;
      const nextYear = displayMonth === 11 ? displayYear + 1 : displayYear;
      days.push({
        day,
        isCurrentMonth: false,
        date: new Date(nextYear, nextMonth, day),
      });
    }

    return days;
  };

  const isSelectedDate = (date: Date) => {
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const years: number[] = [];
    for (let i = currentYear - 50; i <= currentYear + 50; i++) {
      years.push(i);
    }
    return years;
  };

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  if (mode === 'time') {

    return (
      <Modal
        visible={visible}
        animationType="slide"
        transparent={false}
        onRequestClose={onCancel}
      >
        <View style={styles.fullPageModal}>
          <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
            <View style={styles.timeHeader}>
              <Text style={styles.timeTitle}>Select Time</Text>
            </View>

            <View style={styles.timePickerContainer}>
              <View style={styles.timePickerRow}>
                <View style={styles.timeColumn}>
                  <Text style={styles.timeColumnLabel}>Hour</Text>
                  <ScrollView 
                    style={styles.timeScrollView}
                    contentContainerStyle={styles.timeScrollContent}
                    showsVerticalScrollIndicator={false}
                  >
                    {hours.map((h) => (
                      <TouchableOpacity
                        key={h}
                        style={[
                          styles.timeOption,
                          hour === h && [styles.timeOptionSelected, { backgroundColor: themeColors.primary }],
                        ]}
                        onPress={() => {
                          setHour(h);
                          const newDate = new Date(selectedDate);
                          newDate.setHours(h);
                          setSelectedDate(newDate);
                        }}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.timeOptionText,
                            hour === h && styles.timeOptionTextSelected,
                          ]}
                        >
                          {h.toString().padStart(2, '0')}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <Text style={styles.timeSeparator}>:</Text>

                <View style={styles.timeColumn}>
                  <Text style={styles.timeColumnLabel}>Minute</Text>
                  <ScrollView 
                    style={styles.timeScrollView}
                    contentContainerStyle={styles.timeScrollContent}
                    showsVerticalScrollIndicator={false}
                  >
                    {minutes.map((m) => (
                      <TouchableOpacity
                        key={m}
                        style={[
                          styles.timeOption,
                          minute === m && [styles.timeOptionSelected, { backgroundColor: themeColors.primary }],
                        ]}
                        onPress={() => {
                          setMinute(m);
                          const newDate = new Date(selectedDate);
                          newDate.setMinutes(m);
                          setSelectedDate(newDate);
                        }}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.timeOptionText,
                            minute === m && styles.timeOptionTextSelected,
                          ]}
                        >
                          {m.toString().padStart(2, '0')}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.confirmButton, { backgroundColor: themeColors.primary, shadowColor: themeColors.primary }]}
                onPress={handleConfirm}
                activeOpacity={0.7}
              >
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    );
  }

  const calendarDays = generateCalendarDays();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onCancel}
    >
      <View style={styles.fullPageModal}>
        <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={onCancel}
              activeOpacity={0.7}
            >
              <ArrowLeft color={Colors.text} size={24} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Select Date</Text>
            <View style={styles.placeholder} />
          </View>
          
          <ScrollView 
            style={styles.modalScroll}
            contentContainerStyle={styles.modalScrollContent}
            showsVerticalScrollIndicator={false}
          >
          <View style={styles.dateContent}>
            <View style={styles.selectorRow}>
              <TouchableOpacity
                style={styles.selector}
                onPress={() => setShowMonthPicker(!showMonthPicker)}
                activeOpacity={0.7}
              >
                <Text style={styles.selectorText}>{MONTHS[displayMonth]}</Text>
                <ChevronDown color={Colors.text} size={20} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.selector}
                onPress={() => setShowYearPicker(!showYearPicker)}
                activeOpacity={0.7}
              >
                <Text style={styles.selectorText}>{displayYear}</Text>
                <ChevronDown color={Colors.text} size={20} />
              </TouchableOpacity>
            </View>

            {showMonthPicker && (
              <View style={styles.pickerModal}>
                <ScrollView contentContainerStyle={styles.pickerScroll}>
                  {MONTHS.map((month, index) => (
                    <TouchableOpacity
                      key={month}
                      style={[
                        styles.pickerOption,
                        displayMonth === index && [styles.pickerOptionSelected, { backgroundColor: `${themeColors.primary}15` }],
                      ]}
                      onPress={() => {
                        setDisplayMonth(index);
                        setShowMonthPicker(false);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.pickerOptionText,
                          displayMonth === index && [styles.pickerOptionTextSelected, { color: themeColors.primary }],
                        ]}
                      >
                        {month}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {showYearPicker && (
              <View style={styles.pickerModal}>
                <ScrollView contentContainerStyle={styles.pickerScroll}>
                  {generateYears().map((year) => (
                    <TouchableOpacity
                      key={year}
                      style={[
                        styles.pickerOption,
                        displayYear === year && [styles.pickerOptionSelected, { backgroundColor: `${themeColors.primary}15` }],
                      ]}
                      onPress={() => {
                        setDisplayYear(year);
                        setShowYearPicker(false);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.pickerOptionText,
                          displayYear === year && [styles.pickerOptionTextSelected, { color: themeColors.primary }],
                        ]}
                      >
                        {year}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            <View style={styles.daysOfWeekRow}>
              {DAYS_OF_WEEK.map((day) => (
                <View key={day} style={styles.dayOfWeekCell}>
                  <Text style={[
                    styles.dayOfWeekText,
                    day === 'SUN' && [styles.sundayText, { color: themeColors.accent }],
                  ]}>{day}</Text>
                </View>
              ))}
            </View>

            <View style={styles.calendarGrid}>
              {calendarDays.map((dayObj, index) => {
                const isSelected = isSelectedDate(dayObj.date);
                const isSunday = index % 7 === 0;
                
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.dayCell,
                      isSelected && [styles.dayCellSelected, { backgroundColor: themeColors.primary }],
                    ]}
                    onPress={() => {
                      setSelectedDate(dayObj.date);
                      setDisplayMonth(dayObj.date.getMonth());
                      setDisplayYear(dayObj.date.getFullYear());
                    }}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        !dayObj.isCurrentMonth && styles.dayTextInactive,
                        isSelected && styles.dayTextSelected,
                        isSunday && !isSelected && dayObj.isCurrentMonth && [styles.sundayDayText, { color: themeColors.accent }],
                      ]}
                    >
                      {dayObj.day.toString().padStart(2, '0')}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.confirmButton, { backgroundColor: themeColors.primary, shadowColor: themeColors.primary }]}
              onPress={handleConfirm}
              activeOpacity={0.7}
            >
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fullPageModal: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeArea: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    width: 44,
  },
  modalScroll: {
    flex: 1,
  },
  modalScrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  dateContent: {
  },
  selectorRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  selector: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  selectorText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  pickerModal: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginBottom: 16,
    maxHeight: 300,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  pickerScroll: {
    padding: 8,
  },
  pickerOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  pickerOptionSelected: {
  },
  pickerOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
  },
  pickerOptionTextSelected: {
    fontWeight: '700',
  },
  daysOfWeekRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  dayOfWeekCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  dayOfWeekText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
    letterSpacing: 0.5,
  },
  sundayText: {
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  dayCell: {
    width: `${(100 - (6 * 1.2)) / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  dayCellSelected: {
  },
  dayText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  dayTextInactive: {
    color: '#D0D5DD',
  },
  dayTextSelected: {
    color: Colors.white,
    fontWeight: '700',
  },
  sundayDayText: {
  },
  buttonContainer: {
    marginTop: 32,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  confirmButton: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  confirmButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
  },
  timeHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  timeTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
  },
  timePickerContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  timePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  timeColumn: {
    alignItems: 'center',
    flex: 1,
  },
  timeColumnLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  timeScrollView: {
    maxHeight: 300,
    width: '100%',
  },
  timeScrollContent: {
    paddingVertical: 8,
  },
  timeOption: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 4,
    backgroundColor: Colors.white,
  },
  timeOptionSelected: {
  },
  timeOptionText: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
  },
  timeOptionTextSelected: {
    color: Colors.white,
    fontWeight: '700',
  },
  timeSeparator: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 32,
  },
});
