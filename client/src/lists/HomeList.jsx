import React from "react";
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import HomeSection from "../components/SectionList";

const arr = [
    {
        _id: 1,
        listName: "Featured",
        type: "featured", // NEW
        data: [
            {
                _id: 1,
                img: "https://images.pexels.com/photos/1557238/pexels-photo-1557238.jpeg",
                title: "Mind Relaxation",
                length: "12 mins",
            },
            {
                _id: 2,
                img: "https://images.pexels.com/photos/3759657/pexels-photo-3759657.jpeg",
                title: "Deep Breathing",
                length: "16 mins",
            },
        ],
    },
    {
        _id: 2,
        listName: "Collections",
        type: "collection", // NEW
        data: [
            {
                _id: 1,
                img: "https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg",
                title: "Meditate",
                size: "8 videos",
            },
            {
                _id: 2,
                img: "https://images.pexels.com/photos/1051838/pexels-photo-1051838.jpeg",
                title: "Sleep & Calm",
                size: "11 videos",
            },
        ],
    },
    {
        _id: 3,
        listName: "Podcasts",
        type: "podcast", // NEW
        data: [
            {
                _id: 1,
                img: "https://images.pexels.com/photos/3756724/pexels-photo-3756724.jpeg",
                title: "Morning Motivation",
                length: "4 mins",
            },
            {
                _id: 2,
                img: "https://images.pexels.com/photos/3727165/pexels-photo-3727165.jpeg",
                title: "Mindfulness Talk",
                length: "51 mins",
            },
        ],
    },
];

const HomeList = () => {
    return (
        <FlatList
            data={arr}
            keyExtractor={(item) => String(item._id)}
            renderItem={({ item }) => <HomeSection section={item} />}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
                <View style={styles.header}>
                    <TouchableOpacity style={styles.cardRow} activeOpacity={0.5}>
                        <View style={{ flex: 1, paddingRight: 8 }}>
                            <Text style={styles.cardTitle}>How are you feeling today?</Text>
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.h1}>For You</Text>

                    <TouchableOpacity style={styles.cardRow} activeOpacity={0.9}>
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
                </View>
            }
        />
    );
};

export default HomeList;

const styles = StyleSheet.create({
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
});
