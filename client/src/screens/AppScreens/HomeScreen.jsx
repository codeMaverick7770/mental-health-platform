import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

import HomeList from '../../lists/HomeList'

const HomeScreen = () => {
    const [name, setName] = useState('Peter')
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header} >
                <Text style={styles.headerLeft} >Welcome, {name}</Text>
                <Text style={styles.headerRight} >Logo</Text>
            </View>
            <HomeList />
        </SafeAreaView>
    )
}

export default HomeScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#034b3ed5",
        paddingBottom: 40,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: "#FFFFFF",
        borderBottomColor: "#E0E0E0",
        elevation: 2,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
    },
    headerLeft: {
        fontSize: 22,
        fontWeight: "700",
        color: "#333333",
    },
    headerRight: {
        fontSize: 20,
        fontWeight: "600",
        color: "#4CAF50",
    },
})