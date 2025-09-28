import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import HomeList from '../../lists/HomeList'

const LibraryScreen = () => {
    return (
        <View style={styles.main}>
            <HomeList />
        </View>
    )
}

export default LibraryScreen

const styles = StyleSheet.create({
    main: {
        flex: 1,
        backgroundColor: "#034b3ed5",
    },
})