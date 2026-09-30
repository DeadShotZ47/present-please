import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';

export default function StudentLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.cardBackground,
          borderBottomWidth: 2,
          borderBottomColor: Colors.inkDark,
        },
        headerTintColor: Colors.inkDark,
        headerTitleStyle: {
          fontWeight: '900',
          fontSize: 16,
        },
        tabBarStyle: {
          backgroundColor: Colors.cardBackground,
          borderTopWidth: 2,
          borderTopColor: Colors.inkDark,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: Colors.inkDark,
        tabBarInactiveTintColor: Colors.inkMuted,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '800',
          letterSpacing: 0.5,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'หน้าหลัก',
          tabBarLabel: 'หน้าหลัก',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size - 2} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="classes"
        options={{
          title: 'วิชาเรียน',
          tabBarLabel: 'วิชาเรียน',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book-outline" size={size - 2} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'ประวัติการเข้าเรียน',
          tabBarLabel: 'ประวัติ',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document-text-outline" size={size - 2} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'ข้อมูลส่วนตัว',
          tabBarLabel: 'โปรไฟล์',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size - 2} color={color} />
          ),
        }}
      />
      {/* Hidden tab screens for inner flows */}
      <Tabs.Screen
        name="attendance/[sessionId]"
        options={{
          href: null,
          title: 'เช็กชื่อเข้าเรียน',
        }}
      />
      <Tabs.Screen
        name="attendance-detail/[attendanceId]"
        options={{
          href: null,
          title: 'รายละเอียดการเช็กชื่อ',
        }}
      />
    </Tabs>
  );
}
