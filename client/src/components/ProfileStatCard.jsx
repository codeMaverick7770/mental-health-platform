import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'

import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');


const ProfileStatCard = ({ title, value }) => {
    return (
        <TouchableOpacity style={styles.container}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.value}>{value}</Text>
        </TouchableOpacity>
    )
}

export default ProfileStatCard

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#1e1e1ea7",
        width: width * 0.43,
        height: height * 0.16,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        //alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
        padding: 12,
    },
    title: {
        color: '#a3d9e3ff',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 6,
    },
    value: {
        color: '#fff',
        fontSize: 22,
        fontWeight: '700',
    }
})