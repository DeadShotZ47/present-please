import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import Colors from '../constants/Colors';

interface TimePickerModalProps {
  visible: boolean;
  title: string;
  initialTime?: string; // Format "HH:mm"
  onConfirm: (time: string) => void;
  onClose: () => void;
}

const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;
const WHEEL_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS; // 220px
const PADDING_COUNT = 2; // (5 - 1) / 2 = 2 items padding above and below center

// Optimized loop cycles: 5 cycles provides smooth wrap-around in both directions with minimum render overhead
const CYCLES = 5;
const CENTER_CYCLE = 2;

const BASE_HOURS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
const BASE_MINUTES = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

// Build looped arrays once outside component
const LOOPED_HOURS: string[] = [];
for (let c = 0; c < CYCLES; c++) {
  for (let h = 0; h < 24; h++) {
    LOOPED_HOURS.push(BASE_HOURS[h]);
  }
}

const LOOPED_MINUTES: string[] = [];
for (let c = 0; c < CYCLES; c++) {
  for (let m = 0; m < 60; m++) {
    LOOPED_MINUTES.push(BASE_MINUTES[m]);
  }
}

const PRESETS = [
  '08:30',
  '09:00',
  '09:30',
  '10:00',
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

  const hourScrollRef = useRef<ScrollView>(null);
  const minuteScrollRef = useRef<ScrollView>(null);

  // Parse initial time
  const { initialH, initialM } = useMemo(() => {
    if (initialTime && initialTime.includes(':')) {
      const [hStr, mStr] = initialTime.split(':');
      const h = parseInt(hStr, 10);
      const m = parseInt(mStr, 10);
      return {
        initialH: isNaN(h) ? 9 : Math.min(23, Math.max(0, h)),
        initialM: isNaN(m) ? 0 : Math.min(59, Math.max(0, m)),
      };
    }
    return { initialH: 9, initialM: 0 };
  }, [initialTime]);

  const initialHourOffset = (CENTER_CYCLE * 24 + initialH) * ITEM_HEIGHT;
  const initialMinuteOffset = (CENTER_CYCLE * 60 + initialM) * ITEM_HEIGHT;

  // Immediate positioning without lag
  useEffect(() => {
    if (visible) {
      setSelectedHour(initialH.toString().padStart(2, '0'));
      setSelectedMinute(initialM.toString().padStart(2, '0'));

      const frameId = requestAnimationFrame(() => {
        hourScrollRef.current?.scrollTo({
          y: initialHourOffset,
          animated: false,
        });
        minuteScrollRef.current?.scrollTo({
          y: initialMinuteOffset,
          animated: false,
        });
      });

      return () => cancelAnimationFrame(frameId);
    }
  }, [visible, initialH, initialM, initialHourOffset, initialMinuteOffset]);

  const handleHourScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    const rawIdx = Math.round(y / ITEM_HEIGHT);
    const normalizedHour = ((rawIdx % 24) + 24) % 24;
    const hourStr = normalizedHour.toString().padStart(2, '0');
    setSelectedHour(hourStr);

    // Silently reset back to CENTER_CYCLE to maintain infinite loop
    const centerIdx = CENTER_CYCLE * 24 + normalizedHour;
    if (rawIdx !== centerIdx) {
      hourScrollRef.current?.scrollTo({
        y: centerIdx * ITEM_HEIGHT,
        animated: false,
      });
    }
  };

  const handleMinuteScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    const rawIdx = Math.round(y / ITEM_HEIGHT);
    const normalizedMin = ((rawIdx % 60) + 60) % 60;
    const minStr = normalizedMin.toString().padStart(2, '0');
    setSelectedMinute(minStr);

    // Silently reset back to CENTER_CYCLE to maintain infinite loop
    const centerIdx = CENTER_CYCLE * 60 + normalizedMin;
    if (rawIdx !== centerIdx) {
      minuteScrollRef.current?.scrollTo({
        y: centerIdx * ITEM_HEIGHT,
        animated: false,
      });
    }
  };

  const handlePressHour = (globalIndex: number) => {
    const normalizedHour = ((globalIndex % 24) + 24) % 24;
    hourScrollRef.current?.scrollTo({
      y: globalIndex * ITEM_HEIGHT,
      animated: true,
    });
    setSelectedHour(normalizedHour.toString().padStart(2, '0'));
  };

  const handlePressMinute = (globalIndex: number) => {
    const normalizedMin = ((globalIndex % 60) + 60) % 60;
    minuteScrollRef.current?.scrollTo({
      y: globalIndex * ITEM_HEIGHT,
      animated: true,
    });
    setSelectedMinute(normalizedMin.toString().padStart(2, '0'));
  };

  const handleSetCurrentTime = () => {
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes();

    const targetHIdx = CENTER_CYCLE * 24 + h;
    const targetMIdx = CENTER_CYCLE * 60 + m;

    setSelectedHour(h.toString().padStart(2, '0'));
    setSelectedMinute(m.toString().padStart(2, '0'));

    hourScrollRef.current?.scrollTo({
      y: targetHIdx * ITEM_HEIGHT,
      animated: true,
    });
    minuteScrollRef.current?.scrollTo({
      y: targetMIdx * ITEM_HEIGHT,
      animated: true,
    });
  };

  const handleSelectPreset = (presetTime: string) => {
    const [h, m] = presetTime.split(':').map(Number);
    const targetHIdx = CENTER_CYCLE * 24 + h;
    const targetMIdx = CENTER_CYCLE * 60 + m;

    setSelectedHour(h.toString().padStart(2, '0'));
    setSelectedMinute(m.toString().padStart(2, '0'));

    hourScrollRef.current?.scrollTo({
      y: targetHIdx * ITEM_HEIGHT,
      animated: true,
    });
    minuteScrollRef.current?.scrollTo({
      y: targetMIdx * ITEM_HEIGHT,
      animated: true,
    });
  };

  const handleConfirm = () => {
    onConfirm(`${selectedHour}:${selectedMinute}`);
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
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.subtitle}>หมุนวนแบบลูป (23 → 00) เลื่อนขึ้น-ลงได้ต่อเนื่อง</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={styles.closeBtn}
            >
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Current Selection Bar */}
          <View style={styles.selectionSummary}>
            <Text style={styles.summaryLabel}>เวลาที่เลือก:</Text>
            <Text style={styles.summaryTime}>
              {selectedHour}:{selectedMinute} <Text style={styles.summaryUnit}>น.</Text>
            </Text>
            <TouchableOpacity style={styles.nowBtn} onPress={handleSetCurrentTime}>
              <Text style={styles.nowBtnText}>🕒 ใช้เวลาปัจจุบัน</Text>
            </TouchableOpacity>
          </View>

          {/* Column Headers: Exactly aligned with the two wheels below */}
          <View style={styles.colHeadersRow}>
            <View style={styles.colHeaderBox}>
              <View style={styles.headerTag}>
                <Text style={styles.colHeaderTitle}>ชั่วโมง (00 - 23)</Text>
              </View>
            </View>
            <View style={styles.colonHeaderSpacer} />
            <View style={styles.colHeaderBox}>
              <View style={styles.headerTag}>
                <Text style={styles.colHeaderTitle}>นาที (00 - 59)</Text>
              </View>
            </View>
          </View>

          {/* Wheel Picker Container */}
          <View style={styles.wheelWrapper}>
            {/* Center Selection Lens / Active Band Highlight */}
            <View style={styles.selectionLens} pointerEvents="none">
              <View style={styles.lensLineTop} />
              <View style={styles.lensLineBottom} />
            </View>

            {/* Wheels Row */}
            <View style={styles.wheelsRow}>
              {/* Hours Column (Infinite Loop) */}
              <View style={styles.wheelColumn}>
                <ScrollView
                  ref={hourScrollRef}
                  showsVerticalScrollIndicator={false}
                  snapToInterval={ITEM_HEIGHT}
                  decelerationRate="fast"
                  bounces={false}
                  contentOffset={{ x: 0, y: initialHourOffset }}
                  onMomentumScrollEnd={handleHourScrollEnd}
                  onScrollEndDrag={handleHourScrollEnd}
                  contentContainerStyle={styles.wheelScrollContent}
                >
                  {/* Top Spacer to align item in center lens */}
                  <View style={{ height: ITEM_HEIGHT * PADDING_COUNT }} />

                  {LOOPED_HOURS.map((h, index) => {
                    const isSelected = selectedHour === h;
                    return (
                      <TouchableOpacity
                        key={`${h}-${index}`}
                        style={styles.wheelItem}
                        onPress={() => handlePressHour(index)}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.wheelItemText,
                            isSelected && styles.wheelItemTextSelected,
                          ]}
                        >
                          {h}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}

                  {/* Bottom Spacer */}
                  <View style={{ height: ITEM_HEIGHT * PADDING_COUNT }} />
                </ScrollView>
              </View>

              {/* Colon Separator */}
              <View style={styles.colonContainer} pointerEvents="none">
                <Text style={styles.colonText}>:</Text>
              </View>

              {/* Minutes Column (Infinite Loop) */}
              <View style={styles.wheelColumn}>
                <ScrollView
                  ref={minuteScrollRef}
                  showsVerticalScrollIndicator={false}
                  snapToInterval={ITEM_HEIGHT}
                  decelerationRate="fast"
                  bounces={false}
                  contentOffset={{ x: 0, y: initialMinuteOffset }}
                  onMomentumScrollEnd={handleMinuteScrollEnd}
                  onScrollEndDrag={handleMinuteScrollEnd}
                  contentContainerStyle={styles.wheelScrollContent}
                >
                  {/* Top Spacer */}
                  <View style={{ height: ITEM_HEIGHT * PADDING_COUNT }} />

                  {LOOPED_MINUTES.map((m, index) => {
                    const isSelected = selectedMinute === m;
                    return (
                      <TouchableOpacity
                        key={`${m}-${index}`}
                        style={styles.wheelItem}
                        onPress={() => handlePressMinute(index)}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.wheelItemText,
                            isSelected && styles.wheelItemTextSelected,
                          ]}
                        >
                          {m}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}

                  {/* Bottom Spacer */}
                  <View style={{ height: ITEM_HEIGHT * PADDING_COUNT }} />
                </ScrollView>
              </View>
            </View>
          </View>

          {/* Quick Presets Slider */}
          <View style={styles.presetsSection}>
            <Text style={styles.presetsTitle}>เวลาเริ่มเรียนยอดนิยม:</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.presetsList}
            >
              {PRESETS.map((preset) => {
                const isActive = `${selectedHour}:${selectedMinute}` === preset;
                return (
                  <TouchableOpacity
                    key={preset}
                    style={[styles.presetChip, isActive && styles.presetChipActive]}
                    onPress={() => handleSelectPreset(preset)}
                  >
                    <Text
                      style={[
                        styles.presetChipText,
                        isActive && styles.presetChipTextActive,
                      ]}
                    >
                      {preset}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Action Buttons */}
          <View style={styles.footerRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>ยกเลิก</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
              <Text style={styles.confirmBtnText}>
                ยืนยันเวลา ({selectedHour}:{selectedMinute} น.)
              </Text>
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
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.inkDark,
    width: '100%',
    maxWidth: 380,
    padding: 18,
    shadowColor: Colors.inkDark,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 0,
    elevation: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  title: {
    fontSize: 15,
    fontWeight: '900',
    color: Colors.inkDark,
    letterSpacing: 0.8,
  },
  subtitle: {
    fontSize: 11,
    color: Colors.inkMuted,
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  closeIcon: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.inkMuted,
  },
  selectionSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.panelBackground,
    borderWidth: 1.5,
    borderColor: Colors.inkDark,
    borderRadius: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.inkMuted,
  },
  summaryTime: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.inkDark,
    letterSpacing: 1,
  },
  summaryUnit: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.inkMuted,
  },
  nowBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.inkDark,
    borderRadius: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  nowBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.inkDark,
  },
  colHeadersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  colHeaderBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTag: {
    backgroundColor: Colors.panelBackground,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 3,
  },
  colonHeaderSpacer: {
    width: 34, // Exact match to colonContainer
  },
  colHeaderTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.inkDark,
    letterSpacing: 0.5,
  },
  wheelWrapper: {
    height: WHEEL_HEIGHT,
    backgroundColor: '#FAF9F5',
    borderWidth: 1.5,
    borderColor: Colors.inkDark,
    borderRadius: 6,
    position: 'relative',
    overflow: 'hidden',
  },
  selectionLens: {
    position: 'absolute',
    top: ITEM_HEIGHT * PADDING_COUNT, // 88px (centered at 3rd slot)
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    backgroundColor: 'rgba(21, 57, 102, 0.08)',
    zIndex: 2,
  },
  lensLineTop: {
    position: 'absolute',
    top: 0,
    left: 12,
    right: 12,
    height: 1.5,
    backgroundColor: Colors.inkDark,
  },
  lensLineBottom: {
    position: 'absolute',
    bottom: 0,
    left: 12,
    right: 12,
    height: 1.5,
    backgroundColor: Colors.inkDark,
  },
  wheelsRow: {
    flexDirection: 'row',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  wheelColumn: {
    flex: 1,
    height: '100%',
  },
  wheelScrollContent: {
    alignItems: 'center',
  },
  wheelItem: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  wheelItemText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#999990',
  },
  wheelItemTextSelected: {
    fontSize: 26,
    fontWeight: '900',
    color: Colors.inkDark,
    letterSpacing: 1,
  },
  colonContainer: {
    width: 34,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3,
  },
  colonText: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.inkDark,
    marginBottom: 4,
  },
  presetsSection: {
    marginTop: 12,
  },
  presetsTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.inkMuted,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  presetsList: {
    gap: 6,
    paddingVertical: 2,
  },
  presetChip: {
    backgroundColor: '#F5F5F0',
    borderWidth: 1,
    borderColor: Colors.borderLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
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
