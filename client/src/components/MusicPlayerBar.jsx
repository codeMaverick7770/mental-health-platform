import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const {width} = Dimensions.get('window');

const MusicPlayerBar = ({ onPress }) => {
    const insets = useSafeAreaInsets();

    const baseHeight = 32;
    const tabBarHeight = baseHeight + insets.bottom;
    return (
        <View 
            style={[
                styles.container,
                {
                    elevation: 5,
                    shadowColor: "#000",
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                    shadowOffset: { width: 0, height: -2 },
                    marginBottom: tabBarHeight,
                },
            ]}
        >
            <TouchableOpacity onPress={onPress}>
                <View style={styles.leftSection}>
                    <Ionicons name="musical-notes-outline" size={24} color="white" />
                    <View style={styles.songInfo}>
                        <Text style={styles.songTitle}>Song Title</Text>
                        <Text style={styles.artistName}>Artist Name</Text>
                    </View>
                </View>

            </TouchableOpacity>
            <TouchableOpacity style={{ width: width * 0.1 }}>
                <Ionicons name="play-circle-outline" size={32} color="white" />
            </TouchableOpacity>  
        </View>
        
    );
}

export default MusicPlayerBar;

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 16,
        backgroundColor: '#1a1a1a',
        paddingHorizontal: 16,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
        width: width*0.8,
    },
    songInfo: {
        marginLeft: 12,
    },
    songTitle: {
        color: 'white',
        fontWeight: '600',
        fontSize: 16,
    },
    artistName: {
        color: '#bbb',
        fontSize: 12,
    },
});