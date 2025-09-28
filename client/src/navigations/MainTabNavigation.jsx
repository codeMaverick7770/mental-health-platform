import { StyleSheet, Text, View } from 'react-native'
import MusicPlayerBar from '../components/MusicPlayerBar'
import React from 'react'

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HomeScreen from '../screens/AppScreens/HomeScreen';
import ProfileScreen from '../screens/AppScreens/ProfileScreen';
import CommunityScreen from '../screens/AppScreens/CommunityScreen';
import TherapyScreen from '../screens/AppScreens/TherapyScreen';

import Icon from 'react-native-vector-icons/Ionicons';

const Tab = createBottomTabNavigator();

const MainTabNavigation = ({navigation}) => {
    return (
        <View style={{ flex: 1 }}>
            <Tab.Navigator screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;
                    if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
                    else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
                    else if (route.name === 'Community') iconName = focused ? 'people' : 'people-outline';
                    else if (route.name === 'Therapy') iconName = focused ? 'medkit' : 'medkit-outline';

                    return <Icon name={iconName} size={size} color={color} />;
                },

                tabBarActiveTintColor: '#4CAF50',
                tabBarInactiveTintColor: 'gray',
                headerShown: false,
            })}>
                <Tab.Screen name="Home" component={HomeScreen} />
                {/* <Tab.Screen name="Therapy" component={TherapyScreen} /> */}
                <Tab.Screen name="Community" component={CommunityScreen} />
                <Tab.Screen name="Profile" component={ProfileScreen} />
            </Tab.Navigator>
            <MusicPlayerBar
                onPress={() => {
                    navigation.navigate("MusicPlayer")
                }}
            />
        </View>
    )
}

export default MainTabNavigation

const styles = StyleSheet.create({
})