import { StyleSheet, Text, View, Image, FlatList, TouchableOpacity } from 'react-native';
import React from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context'

const playlist = {
    cover: 'https://images.pexels.com/photos/1557238/pexels-photo-1557238.jpeg',
    title: 'Chill Vibes Playlist',
    description: 'Relax and unwind with these calming tracks.',
    tracks: [
        { id: '1', title: 'Mind Relaxation', artist: 'Calm Beats', length: '4:12' },
        { id: '2', title: 'Deep Breathing', artist: 'Zen Mode', length: '3:45' },
        { id: '3', title: 'Morning Motivation', artist: 'Uplift', length: '5:01' },
        { id: '4', title: 'Sleep & Calm', artist: 'Dreamscape', length: '6:22' },
        { id: '5', title: 'Meditate', artist: 'Inner Peace', length: '7:10' },
        { id: '6', title: 'Focus Flow', artist: 'Study Sounds', length: '3:58' },
        { id: '7', title: 'Evening Chill', artist: 'Night Owl', length: '4:44' },
        { id: '8', title: 'Gentle Waves', artist: 'Oceanic', length: '5:30' },
        { id: '9', title: 'Peaceful Mind', artist: 'Serenity', length: '4:20' },
        { id: '10', title: 'Cloud Surfing', artist: 'Skyline', length: '3:55' },
    ],
}; 

const TrackItem = ({ item, index }) => (
    <TouchableOpacity style={styles.trackRow} activeOpacity={0.7}>
        <View style={styles.trackIndexWrap}>
            <Text style={styles.trackIndex}>{index + 1}</Text>
        </View>
        <View style={{ flex: 1 }}>
            <Text style={styles.trackTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.trackArtist}>{item.artist}</Text>
        </View>
        <Text style={styles.trackLength}>{item.length}</Text>
        <Icon name="play-arrow" size={28} color="#fff" style={{ marginLeft: 8 }} />
    </TouchableOpacity>
);

const MediaCollectionScreen = () => {
    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                ListHeaderComponent={
                    <>
                        <View style={styles.header}>
                            <Image source={{ uri: playlist.cover }} style={styles.cover} />
                            <Text style={styles.title}>{playlist.title}</Text>
                            <Text style={styles.description}>{playlist.description}</Text>
                        </View>
                        <Text style={styles.sectionTitle}>Playlist</Text>
                    </>
                }
                data={playlist.tracks}
                keyExtractor={item => item.id}
                renderItem={({ item, index }) => <TrackItem item={item} index={index} />}
                contentContainerStyle={{ paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
};

export default MediaCollectionScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#034b3ed5',
    },
    header: {
        alignItems: 'center',
        paddingTop: 24,
        paddingBottom: 16,
        backgroundColor: 'transparent',
    },
    cover: {
        width: 160,
        height: 160,
        borderRadius: 16,
        marginBottom: 18,
        backgroundColor: '#222',
    },
    title: {
        fontSize: 26,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 6,
        textAlign: 'center',
    },
    description: {
        fontSize: 15,
        color: '#e0e0e0',
        marginBottom: 10,
        textAlign: 'center',
        paddingHorizontal: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
        marginLeft: 18,
        marginBottom: 8,
        marginTop: 8,
    },
    trackRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#303434c7',
        borderRadius: 10,
        marginHorizontal: 14,
        marginBottom: 10,
        paddingVertical: 12,
        paddingHorizontal: 14,
    },
    trackIndexWrap: {
        width: 28,
        alignItems: 'center',
        marginRight: 10,
    },
    trackIndex: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
    },
    trackTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    trackArtist: {
        color: '#b0b0b0',
        fontSize: 13,
        marginTop: 2,
    },
    trackLength: {
        color: '#fff',
        fontSize: 14,
        marginLeft: 10,
        minWidth: 48,
        textAlign: 'right',
    },
});