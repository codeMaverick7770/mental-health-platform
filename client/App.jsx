import { StyleSheet } from 'react-native'
import React from 'react'

import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { NavigationContainer } from '@react-navigation/native';
import { enableScreens } from 'react-native-screens'

import StackNavigation from './src/navigations/StackNavigation'
import MainTabNavigation from './src/navigations/MainTabNavigation'

enableScreens();

const App = () => {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
                <NavigationContainer>
                    <MainTabNavigation />
                </NavigationContainer>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    )
}

export default App

const styles = StyleSheet.create({})

