import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

import DashboardScreen from '../screens/ProfileTabScreens/DashboardScreen';
import LibraryScreen from '../screens/ProfileTabScreens/LibraryScreen';
import HistoryScreen from '../screens/ProfileTabScreens/HistoryScreen';

const Tab = createMaterialTopTabNavigator();

const ProfileTabs = () => {
  return (
      <Tab.Navigator
          screenOptions={{
              tabBarIndicatorStyle: { backgroundColor: '#fff' },
              tabBarLabelStyle: { fontSize: 14, fontWeight: '700', color: '#fff' },
              tabBarStyle: { backgroundColor: '#034b3ed5' },
          }}
      >
          <Tab.Screen name="DashBoard" component={DashboardScreen} />
          <Tab.Screen name="Library" component={LibraryScreen} />
          <Tab.Screen name="History" component={HistoryScreen} />
      </Tab.Navigator>
  )
}

export default ProfileTabs

const styles = StyleSheet.create({})