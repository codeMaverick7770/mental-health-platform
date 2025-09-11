import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

import CommunityList from '../../lists/CommunityList'
import { SafeAreaView } from 'react-native-safe-area-context'

const CommunityScreen = () => {
  return (
    <SafeAreaView style={styles.main}>
        <View style={styles.container}>
            <Text style={styles.header} >Community</Text>
            <CommunityList />
        </View>
    </SafeAreaView>
  )
}

export default CommunityScreen

const styles = StyleSheet.create({
    main: {
        flex: 1,
        backgroundColor: "#034b3ed5",
        paddingHorizontal: 0,
        paddingTop: 20,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    header: {
        fontSize: 26,
        fontWeight: '700',
        color: '#fff',
        textAlign: 'center',
        marginVertical: 8,
    },
})