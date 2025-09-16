import React from "react";
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
} from "react-native";
import SectionList from "./SectionList";

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
            {
                _id: 3,
                img: "https://images.pexels.com/photos/1557238/pexels-photo-1557238.jpeg",
                title: "Mind Relaxation",
                length: "12 mins",
            },
            {
                _id: 4,
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
            {
                _id: 3,
                img: "https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg",
                title: "Meditate",
                size: "8 videos",
            },
            {
                _id: 4,
                img: "https://images.pexels.com/photos/1051838/pexels-photo-1051838.jpeg",
                title: "Sleep & Calm",
                size: "11 videos",
            },
        ],
    },
    {
        _id: 3,
        listName: "Podcasts",
        type: "single", // NEW
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
            {
                _id: 3,
                img: "https://images.pexels.com/photos/3756724/pexels-photo-3756724.jpeg",
                title: "Morning Motivation",
                length: "4 mins",
            },
            {
                _id: 4,
                img: "https://images.pexels.com/photos/3727165/pexels-photo-3727165.jpeg",
                title: "Mindfulness Talk",
                length: "51 mins",
            },
        ],
    },
];

const HomeList = ({ListHeader}) => {
    return (
        <FlatList
            data={arr}
            keyExtractor={(item) => String(item._id)}
            renderItem={({ item }) => <SectionList section={item} />}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={ListHeader}
        />
    );
};

export default HomeList;

const styles = StyleSheet.create({});
