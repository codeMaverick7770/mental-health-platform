import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

import { createStackNavigator } from '@react-navigation/stack'

import SignInScreen from '../screens/InitialScreens/SignInScreen'
import SignUpScreen from '../screens/InitialScreens/SignUpScreen'
import ForgotPasswordScreen from '../screens/InitialScreens/ForgotPasswordScreen'
import OTPScreen from '../screens/InitialScreens/OTPScreen'
import AppStackNavigation from '../navigations/AppStackNavigation'

const Stack = createStackNavigator();

const InitialStackNavigations = () => {
    return (
        <View style={{ flex: 1 }}>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="SignIn" component={SignInScreen} />
                <Stack.Screen name="SignUp" component={SignUpScreen} />
                <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
                <Stack.Screen name="OTP" component={OTPScreen} />
                <Stack.Screen name="AppStack" component={AppStackNavigation} />
            </Stack.Navigator>
        </View>
    )
}

export default InitialStackNavigations

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
})