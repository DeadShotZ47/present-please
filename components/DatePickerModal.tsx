import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Colors from '../constants/Colors';

interface DatePickerModalProps {
  visible: boolean;
  selectedDate: string; // "YYYY-MM-DD"
  onConfirm: (date: string) => void;
  onClose: () => void;
}

export const DatePickerModal: React.FC<DatePickerModalProps> = ({
  visible,
  selectedDate,
  onConfirm,
  onClose,
}) => {
  const [currentSelected, setCurrentSelected] = useState(selectedDate);

  // Generate next 14 days
  const days: { dateStr: string; label: string; isToday: boolean }[] = [];
  const today = new Date();
  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const isToday = i === 0;
    const isTomorrow = i === 1;

    let dayName = d.toLocaleDateString('th-TH', { weekday: 'short' });
    let dateFormatted = d.toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    let label = `${dayName} ${dateFormatted}`;
    if (isToday) label += ' (วันนี้)';
    if (isTomorrow) label += ' (พรุ่งนี้)';

    days.push({ dateStr, label, isToday });
  }

  const handleConfirm = () => {
    onConfirm(currentSelected);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>เลือกวันที่สอน</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.listScroll}>
            {days.map((item) => {
              const isSelected = currentSelected === item.dateStr;
              return (
                <TouchableOpacity
                  key={item.dateStr}
                  style={[styles.dayItem, isSelected && styles.dayItemActive]}
                  onPress={() => setCurrentSelected(item.dateStr)}
                >
                  <Text style={[styles.dayText, isSelected && styles.dayTextActive]}>
                    {item.label}
                  </Text>
                  <Text style={[styles.dateCode, isSelected && styles.dateCodeActive]}>
                    {item.dateStr}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={styles.footerRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>ยกเลิก</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
              <Text style={styles.confirmBtnText}>ยืนยันวันที่</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.inkDark,
    width: '100%',
    maxWidth: 380,
    maxHeight: '80%',
    padding: 18,
    elevation: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '900',
    color: Colors.inkDark,
    letterSpacing: 0.8,
  },
  closeIcon: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.inkMuted,
    padding: 4,
  },
  listScroll: {
    maxHeight: 280,
    marginVertical: 8,
  },
  dayItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: 4,
    marginBottom: 6,
    backgroundColor: '#F9F8F5',
  },
  dayItemActive: {
    backgroundColor: Colors.inkDark,
    borderColor: Colors.inkDark,
  },
  dayText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.inkDark,
  },
  dayTextActive: {
    color: '#FFFFFF',
  },
  dateCode: {
    fontSize: 11,
    color: Colors.inkMuted,
    fontWeight: '600',
  },
  dateCodeActive: {
    color: '#E0E0E0',
  },
  footerRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#EFEFEA',
    borderWidth: 1.5,
    borderColor: Colors.inkDark,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 4,
  },
  cancelBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.inkDark,
  },
  confirmBtn: {
    flex: 2,
    backgroundColor: Colors.inkDark,
    borderWidth: 1.5,
    borderColor: Colors.inkDark,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 4,
  },
  confirmBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
