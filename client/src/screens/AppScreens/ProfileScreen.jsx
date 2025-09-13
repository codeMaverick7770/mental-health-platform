import { StyleSheet, Text, View, ScrollView } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

import ProfileTabs from '../../navigations/ProfileTabs'

const ProfileScreen = () => {
    return (
        <SafeAreaView style={styles.main}>
            <View style={styles.container}>
                <Text style={styles.header} >Profile</Text>
                <ProfileTabs />
            </View>
        </SafeAreaView>
    )
}

export default ProfileScreen

const styles = StyleSheet.create({
    main: {
        flex: 1,
        backgroundColor: "#034b3ed5",
        paddingHorizontal: 0,
        paddingTop: 20,
        paddingBottom: 40,
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