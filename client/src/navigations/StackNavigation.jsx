import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

import { createStackNavigator } from '@react-navigation/stack'

import SignInScreen from '../screens/InitialScreens/SignInScreen'
import SignUpScreen from '../screens/InitialScreens/SignUpScreen'
import ForgotPasswordScreen from '../screens/InitialScreens/ForgotPasswordScreen'

const Stack = createStackNavigator();

const StackNavigations = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name='SignIn' component={SignInScreen} />
            <Stack.Screen name='SignUp' component={SignUpScreen} />
            <Stack.Screen name='ForgotPassword' component={ForgotPasswordScreen} />
        </Stack.Navigator>
    )
}

export default StackNavigations

const styles = StyleSheet.create({})