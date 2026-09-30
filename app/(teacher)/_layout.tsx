import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';

export default function TeacherLayout() {
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
          title: 'COMMAND DASHBOARD',
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size - 2} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="sessions"
        options={{
          title: 'SESSION REGISTRY',
          tabBarLabel: 'Sessions',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list-outline" size={size - 2} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="create-session"
        options={{
          title: 'OPEN CHECKPOINT',
          tabBarLabel: 'New Session',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle-outline" size={size - 2} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'FACULTY IDENTITY',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size - 2} color={color} />
          ),
        }}
      />
      {/* Hidden tab screen for teacher session roster */}
      <Tabs.Screen
        name="attendance/[sessionId]"
        options={{
          href: null,
          title: 'SESSION ATTENDANCE ROSTER',
        }}
      />
    </Tabs>
  );
}
