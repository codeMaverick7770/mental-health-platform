import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import { useNavigation } from '@react-navigation/native';

const CommunityCard = ({ item }) => {
    const navigation = useNavigation();
    const [joined, setJoined] = useState(false);
    const goToChat = () => {
        if(joined){
            navigation.navigate("Chat", { title: item.communityName, _id: item._id });
        }
    }
    const joinHandler = () => {
        const val = joined
        setJoined(!val);
    }
    return (
        <TouchableOpacity style={styles.container} activeOpacity={0.85} onPress={goToChat}>
            <Image source={{ uri: item.img }} style={styles.image} />
            <View style={styles.contentRow}>
                <View style={styles.textContainer}>
                    <Text style={styles.title} numberOfLines={1}>{item.communityName}</Text>
                    <Text style={styles.meta}>Members: {item.membersCount}</Text>
                </View>
                <TouchableOpacity style={[styles.joinBtn, joined ? styles.joined : styles.notJoined]} activeOpacity={0.8} onPress={joinHandler}>
                    <Text style={styles.joinBtnText}>{joined ? "Joined" : "Join Community"}</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    )
}

export default CommunityCard

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#1e1e1ea7',
        borderRadius: 12,
        marginBottom: 16,
        marginHorizontal: 15,
        overflow: 'hidden',
        marginRight: 14,
        padding: 5,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    contentRow: {
        flex: 1,
        //flexDirection: 'row',
        //alignItems: 'center',
        justifyContent: 'space-between',
        gap: 5,
    },
    image: {
        width: 75,
        height: 75,
        borderRadius: 25,
        margin: 10,
    },
    textContainer: {
        flex: 1,
        paddingVertical: 8,
        paddingHorizontal: 0,
        alignItems: 'flex-start',
        justifyContent: 'center',
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 2,
    },
    meta: {
        fontSize: 12,
        color: '#bbb',
        marginBottom: 8,
    },
    joinBtn: {
        borderRadius: 8,
        paddingVertical: 6,
        paddingHorizontal: 16,
        marginHorizontal: 15,
        marginBottom: 10,
        alignItems: 'center',
    },
    joined: {
        backgroundColor: '#1e1e1ea7',
        borderWidth: 2,
        borderColor: '#fff'
    },
    notJoined: {
        backgroundColor: '#4CAF50',
    },
    joinBtnText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 13,
    },
});