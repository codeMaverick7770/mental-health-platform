import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

import Icon from "react-native-vector-icons/MaterialIcons";

import HomeList from '../../lists/HomeList'
import { initSocket, socket } from '../../utils/socket';
import SessionCard from '../../components/SessionCard';

const HomeScreen = ({ navigation }) => {
    const [name, setName] = useState('Peter')

    let session;
    session = {
        _id: "sess_12345678",
        userName: "Sarah Johnson",
        scheduledAt: "2024-01-15T10:00:00Z",
        status: "scheduled",
        duration: 60
    }

    // useEffect(() => {
    //     const connectSocket = async () => {
    //         const authToken = await AsyncStorage.getItem('authToken');
    //         initSocket(authToken);
    //     }
        
    //     connectSocket();

    //     return () => {
    //         socket.disconnect(); // ✅ disconnects only on unmount
    //         console.log('Socket disconnected on component unmount');
    //     };
    // }, []);

    const ListHeader = () => {
        return (
            <>
                <View style={styles.navBar} >
                    <Text style={styles.navBarLeft} >Welcome, {name}</Text>
                    <Text style={styles.navBarRight} >Logo</Text>
                </View>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.cardRow} activeOpacity={0.5}>
                        <View style={{ flex: 1, paddingRight: 8 }}>
                            <Text style={styles.cardTitle}>How are you feeling today?</Text>
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.h1}>For You</Text>

                    <TouchableOpacity style={styles.cardRow} activeOpacity={0.9} onPress={() => navigation.navigate("AIScreen")}>
                        <View>
                            <Icon name="mic" size={40} color="white" style={{ marginRight: 12 }} />
                        </View>
                        <View>
                            <Text style={styles.cardTitle}>AI Counselor</Text>
                            <Text style={styles.cardSub}>Start a conversation</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.cardRow} activeOpacity={0.9}>
                        <View style={{ flex: 1, paddingRight: 8 }}>
                            <Text style={styles.cardTitle}>Continue journal entry</Text>
                            <Text style={styles.cardSub}>Lorem ipsum dolor sit amet…</Text>
                        </View>
                        <Icon name="chevron-right" size={20} color="grey" />
                    </TouchableOpacity>
                    {session && (
                        <>
                            <Text style={styles.h1}>Upcoming Session</Text>
                            <SessionCard item={session} />
                        </> 
                    )}
                </View>
            </>
        )
    }
    return (
        <SafeAreaView style={styles.container}>
            <HomeList ListHeader={ListHeader} />
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
    navBar: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: "#303434c7",
        elevation: 4,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
    },
    navBarLeft: {
        fontSize: 22,
        fontWeight: "700",
        color: "#fff",
    },
    navBarRight: {
        fontSize: 20,
        fontWeight: "600",
        color: "#4CAF50",
    },
    header: { padding: 16 },
    h1: {
        fontSize: 24,
        fontWeight: "600",
        marginBottom: 12,
        color: "#fff",
    },
    cardRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: 'space-around',
        backgroundColor: "#303434c7",
        borderRadius: 12,
        padding: 20,
        marginBottom: 12,
    },
    IconWrapper: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.15)', // subtle fade
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    cardTitle: { fontSize: 16, fontWeight: "700", color: "#fff" },
    cardSub: { color: "#fff", marginTop: 2 },
})