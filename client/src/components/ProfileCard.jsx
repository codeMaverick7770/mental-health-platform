import { Image, StyleSheet, Text, View } from 'react-native'
import React from 'react'

const ProfileCard = ({ item }) => {
    console.log(item);
    return (
        <View style={styles.container}>
            <Image style={styles.image} source={{ uri: item.imageuri }} />
            <View style={styles.txtContainer}>
                <Text style={styles.txt1} numberOfLines={3}>{item.qoute}</Text>
                <Text style={styles.txt2}>{item.date}</Text>
            </View>
        </View>
    )
}

export default ProfileCard

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#1e1e1ea7",
        borderRadius: 12,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        width: 340,
        minHeight: 120,
    },
    image: {
        margin: 8,
        width: 100,
        height: 100,
        borderRadius: 200,
    },
    txtContainer: {
        width: 220,
        padding: 10,
        borderRadius: 8,
    },
    txt1: {
        color: '#fff',
        flexWrap: "wrap",
        fontSize: 15,
        fontWeight: '500',
        marginBottom: 6,
    },
    txt2: {
        color: '#aeadadff',
        fontWeight: '600',
        fontSize: 13,
    }
})