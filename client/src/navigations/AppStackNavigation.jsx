import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

import { createStackNavigator } from '@react-navigation/stack'

import MainTabNavigation from './MainTabNavigation'
import MusicPlayerScreen from '../screens/AdditionalScreens/MusicPlayerScreen'

const Stack = createStackNavigator();

const AppStackNavigation = () => {
    return (
        <View style={{ flex: 1 }}>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Main" component={MainTabNavigation} />
                <Stack.Screen name="MusicPlayer" component={MusicPlayerScreen} />
            </Stack.Navigator>
        </View>
    )
}

export default AppStackNavigation

const styles = StyleSheet.create({})