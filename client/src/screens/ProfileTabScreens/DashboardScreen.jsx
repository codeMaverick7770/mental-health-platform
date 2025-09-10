import { ScrollView, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import ProfileStatCard from '../../components/ProfileStatCard'
import ProfileCard from '../../components/ProfileCard'

const item = {
    imageuri: "https://img.freepik.com/free-vector/tiktok-profile-picture-template_742173-4482.jpg?t=st=1757507971~exp=1757511571~hmac=2180d6a9ae525ec43a3b90ac68ade5b52789e16d111a34717befece8b4042388&w=2000",
    qoute: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quo aliquam itaque voluptatibus. Nam ipsum reiciendis molestias rem fugiat distinctio aspernatur?',
    date: 'Sep 10'
}

const DashboardScreen = () => {
    return (
        <ScrollView style={styles.main} contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
            <View style={styles.profileCardWrapper}>
                <ProfileCard item={item} />
            </View>
            <Text style={styles.header}>Statistics</Text>
            <View style={styles.statsWrapper}>
                <View style={styles.grid}>
                    <ProfileStatCard title="Total Sessions" value="12" />
                    <ProfileStatCard title="Streak" value="5 Days" />
                    <ProfileStatCard title="Mindful Days" value="5 Days" />
                    <ProfileStatCard title="Mindful Minutes" value="2h 31m" />
                </View>
            </View>
        </ScrollView>
    )
}

export default DashboardScreen

const styles = StyleSheet.create({
    main: {
        flex: 1,
        backgroundColor: "#034b3ed5",
    },
    profileCardWrapper: {
        alignItems: 'center',
        marginVertical: 10,
    },
    header: {
        fontSize: 22,
        fontWeight: '700',
        color: '#fff',
        marginLeft: 24,
        marginVertical: 8,
    },
    statsWrapper: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        gap: 16,
        width: '92%',
    },
})