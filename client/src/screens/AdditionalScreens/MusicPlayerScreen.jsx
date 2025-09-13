import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native'
import React from 'react'
import Ionicons from 'react-native-vector-icons/Ionicons'

const MusicPlayerScreen = () => {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerLeft}>Now Playing</Text>
                <Ionicons name="musical-notes-outline" size={28} color="#4CAF50" />
            </View>
            <View style={styles.card}>
                <Image
                    source={{ uri: 'https://images.pexels.com/photos/164936/pexels-photo-164936.jpeg' }}
                    style={styles.albumArt}
                />
                <Text style={styles.songTitle}>Song Title</Text>
                <Text style={styles.artistName}>Artist Name</Text>
            </View>
            <View style={styles.footer}>
                <View style={styles.controls}>
                    <TouchableOpacity>
                        <Ionicons name="play-back" size={36} color="#4CAF50" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.playButton}>
                        <Ionicons name="play-circle" size={60} color="#61e066ff" />
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <Ionicons name="play-forward" size={36} color="#4CAF50" />
                    </TouchableOpacity>
                </View>
                <View style={styles.progressBarWrapper}>
                    <View style={styles.progressBarBg}>
                        <View style={styles.progressBarFill} />
                    </View>
                    <View style={styles.timeRow}>
                        <Text style={styles.time}>1:12</Text>
                        <Text style={styles.time}>3:45</Text>
                    </View>
                </View>
            </View>
        </View>
    )
}

export default MusicPlayerScreen

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
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        marginHorizontal: 24,
        paddingHorizontal: 24,
        marginVertical: 12,
        paddingVertical: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
        elevation: 4,
    },
    albumArt: {
        width: 220,
        height: 220,
        borderRadius: 16,
        marginBottom: 18,
    },
    songTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#333',
        marginTop: 8,
    },
    artistName: {
        fontSize: 16,
        color: '#4CAF50',
        marginBottom: 18,
    },
    footer: {
        marginHorizontal: 16,
        paddingHorizontal: 16,
        marginVertical: 8,
        paddingVertical: 8,
        alignItems: 'center',
        // shadowColor: '#000',
        // shadowOpacity: 0.08,
        // shadowOffset: { width: 0, height: 2 },
        // shadowRadius: 8,
        //elevation: 4,
    },
    controls: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 18,
    },
    playButton: {
        marginHorizontal: 32,
    },
    progressBarWrapper: {
        width: '100%',
        marginTop: 10,
    },
    progressBarBg: {
        height: 6,
        backgroundColor: '#eee',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBarFill: {
        width: '40%',
        height: 6,
        backgroundColor: '#61e066ff',
        borderRadius: 3,
    },
    timeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    time: {
        fontSize: 12,
        fontWeight: 600,
        color: '#ffffffff',
    },
})