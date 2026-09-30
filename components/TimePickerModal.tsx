import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Colors from '../constants/Colors';

interface TimePickerModalProps {
  visible: boolean;
  title: string;
  initialTime?: string; // Format "HH:mm"
  onConfirm: (time: string) => void;
  onClose: () => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
const MINUTES = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];

const PRESETS = [
  '08:00',
  '08:30',
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '12:00',
  '13:00',
  '13:30',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
];

export const TimePickerModal: React.FC<TimePickerModalProps> = ({
  visible,
  title,
  initialTime = '09:00',
  onConfirm,
  onClose,
}) => {
  const [selectedHour, setSelectedHour] = useState('09');
  const [selectedMinute, setSelectedMinute] = useState('00');
  const [activeTab, setActiveTab] = useState<'hour' | 'minute'>('hour');

  useEffect(() => {
    if (initialTime && initialTime.includes(':')) {
      const [h, m] = initialTime.split(':');
      setSelectedHour(h.padStart(2, '0'));
      setSelectedMinute(m.padStart(2, '0'));
    }
  }, [initialTime, visible]);

  const handleSetCurrentTime = () => {
    const now = new Date();
    setSelectedHour(now.getHours().toString().padStart(2, '0'));
    // Round to nearest 5 minutes
    const rawMin = now.getMinutes();
    const roundedMin = (Math.round(rawMin / 5) * 5) % 60;
    setSelectedMinute(roundedMin.toString().padStart(2, '0'));
  };

  const handleSelectPreset = (timeStr: string) => {
    const [h, m] = timeStr.split(':');
    setSelectedHour(h);
    setSelectedMinute(m);
  };

  const adjustMinute = (delta: number) => {
    let m = parseInt(selectedMinute, 10) + delta;
    if (m < 0) m = 59;
    if (m > 59) m = 0;
    setSelectedMinute(m.toString().padStart(2, '0'));
  };

  const handleConfirm = () => {
    const formatted = `${selectedHour}:${selectedMinute}`;
    onConfirm(formatted);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Big Time Display */}
          <View style={styles.timeDisplayBox}>
            <TouchableOpacity
              style={[
                styles.timeBox,
                activeTab === 'hour' && styles.timeBoxActive,
              ]}
              onPress={() => setActiveTab('hour')}
            >
              <Text style={[styles.timeDigit, activeTab === 'hour' && styles.timeDigitActive]}>
                {selectedHour}
              </Text>
              <Text style={styles.timeUnitLabel}>ชั่วโมง</Text>
            </TouchableOpacity>

            <Text style={styles.colon}>:</Text>

            <TouchableOpacity
              style={[
                styles.timeBox,
                activeTab === 'minute' && styles.timeBoxActive,
              ]}
              onPress={() => setActiveTab('minute')}
            >
              <Text style={[styles.timeDigit, activeTab === 'minute' && styles.timeDigitActive]}>
                {selectedMinute}
              </Text>
              <Text style={styles.timeUnitLabel}>นาที</Text>
            </TouchableOpacity>

            <Text style={styles.thaiUnit}>น.</Text>
          </View>

          {/* Tab Selector */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'hour' && styles.tabActive]}
              onPress={() => setActiveTab('hour')}
            >
              <Text style={[styles.tabText, activeTab === 'hour' && styles.tabTextActive]}>
                เลือกชั่วโมง (00 - 23)
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'minute' && styles.tabActive]}
              onPress={() => setActiveTab('minute')}
            >
              <Text style={[styles.tabText, activeTab === 'minute' && styles.tabTextActive]}>
                เลือกนาที (00 - 55)
              </Text>
            </TouchableOpacity>
          </View>

          {/* Selector Grid */}
          {activeTab === 'hour' ? (
            <ScrollView style={styles.gridScroll} contentContainerStyle={styles.gridContainer}>
              {HOURS.map((h) => {
                const isSelected = selectedHour === h;
                return (
                  <TouchableOpacity
                    key={h}
                    style={[styles.gridItem, isSelected && styles.gridItemActive]}
                    onPress={() => {
                      setSelectedHour(h);
                      setActiveTab('minute'); // Auto switch to minute for smooth flow
                    }}
                  >
                    <Text style={[styles.gridItemText, isSelected && styles.gridItemTextActive]}>
                      {h}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          ) : (
            <View>
              <ScrollView style={styles.gridScroll} contentContainerStyle={styles.gridContainer}>
                {MINUTES.map((m) => {
                  const isSelected = selectedMinute === m;
                  return (
                    <TouchableOpacity
                      key={m}
                      style={[styles.gridItem, isSelected && styles.gridItemActive]}
                      onPress={() => setSelectedMinute(m)}
                    >
                      <Text style={[styles.gridItemText, isSelected && styles.gridItemTextActive]}>
                        :{m}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
              {/* Stepper for fine-tuning minute */}
              <View style={styles.stepperRow}>
                <TouchableOpacity style={styles.stepBtn} onPress={() => adjustMinute(-1)}>
                  <Text style={styles.stepBtnText}>- 1 นาที</Text>
                </TouchableOpacity>
                <Text style={styles.minuteFineText}>ปรับละเอียด: {selectedMinute} นาที</Text>
                <TouchableOpacity style={styles.stepBtn} onPress={() => adjustMinute(1)}>
                  <Text style={styles.stepBtnText}>+ 1 นาที</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Quick presets & Current Time */}
          <View style={styles.presetSection}>
            <View style={styles.presetHeader}>
              <Text style={styles.presetTitle}>เวลากลาง / เวลาด่วน:</Text>
              <TouchableOpacity style={styles.nowBtn} onPress={handleSetCurrentTime}>
                <Text style={styles.nowBtnText}>🕒 ใช้เวลาปัจจุบัน</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetsList}>
              {PRESETS.map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[styles.presetChip, `${selectedHour}:${selectedMinute}` === p && styles.presetChipActive]}
                  onPress={() => handleSelectPreset(p)}
                >
                  <Text
                    style={[
                      styles.presetChipText,
                      `${selectedHour}:${selectedMinute}` === p && styles.presetChipTextActive,
                    ]}
                  >
                    {p}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Actions */}
          <View style={styles.footerRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>ยกเลิก</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
              <Text style={styles.confirmBtnText}>ยืนยันเวลา ({selectedHour}:{selectedMinute} น.)</Text>
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
    maxHeight: '90%',
    padding: 18,
    shadowColor: Colors.inkDark,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 0,
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
  timeDisplayBox: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.panelBackground,
    borderWidth: 1.5,
    borderColor: Colors.inkDark,
    borderRadius: 6,
    paddingVertical: 12,
    marginBottom: 14,
  },
  timeBox: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: 'transparent',
    alignItems: 'center',
  },
  timeBoxActive: {
    backgroundColor: Colors.cardBackground,
    borderColor: Colors.inkDark,
  },
  timeDigit: {
    fontSize: 32,
    fontWeight: '900',
    color: Colors.inkMuted,
    letterSpacing: 2,
  },
  timeDigitActive: {
    color: Colors.inkDark,
  },
  timeUnitLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.inkMuted,
    marginTop: 2,
  },
  colon: {
    fontSize: 32,
    fontWeight: '900',
    color: Colors.inkDark,
    marginHorizontal: 4,
  },
  thaiUnit: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.inkDark,
    marginLeft: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    borderWidth: 1.5,
    borderColor: Colors.inkDark,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: '#F5F5F0',
  },
  tabActive: {
    backgroundColor: Colors.inkDark,
  },
  tabText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.inkMuted,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  gridScroll: {
    maxHeight: 150,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    paddingVertical: 4,
  },
  gridItem: {
    width: 48,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F0',
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: 4,
  },
  gridItemActive: {
    backgroundColor: Colors.stampBlue,
    borderColor: Colors.inkDark,
  },
  gridItemText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.inkDark,
  },
  gridItemTextActive: {
    color: '#FFFFFF',
  },
  stepperRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingHorizontal: 8,
  },
  stepBtn: {
    backgroundColor: '#EFEFEA',
    borderWidth: 1,
    borderColor: Colors.inkDark,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  stepBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.inkDark,
  },
  minuteFineText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.inkMuted,
  },
  presetSection: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: Colors.borderLight,
  },
  presetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  presetTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.inkMuted,
    letterSpacing: 0.5,
  },
  nowBtn: {
    backgroundColor: Colors.panelBackground,
    borderWidth: 1,
    borderColor: Colors.inkDark,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 3,
  },
  nowBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.inkDark,
  },
  presetsList: {
    gap: 6,
    paddingVertical: 4,
  },
  presetChip: {
    backgroundColor: '#F5F5F0',
    borderWidth: 1,
    borderColor: Colors.borderLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
  },
  presetChipActive: {
    backgroundColor: Colors.inkDark,
    borderColor: Colors.inkDark,
  },
  presetChipText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.inkDark,
  },
  presetChipTextActive: {
    color: '#FFFFFF',
  },
  footerRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
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
