import { useNavigation } from "@react-navigation/native";
import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";

const MediaCard = ({ item, type }) => {
    const navigation = useNavigation();
    return (
        <TouchableOpacity
            style={[
                styles.card,
                type === "collection" && styles.collectionCard,
                type === "single" && styles.singleCard,
            ]}
            activeOpacity={0.8}
            onPress={() => navigation.navigate("MediaCollection")}
        >

            <Image
                source={{ uri: item.img }}
                style={[
                    styles.image,
                    type === "collection" && styles.collectionImage,
                    type === "single" && styles.singleImage,
                ]}
            />

            <View style={styles.textContainer}>
                <Text
                    style={[
                        styles.title,
                        type === "single" && styles.singleTitle,
                    ]}
                    numberOfLines={1}
                >
                    {item.title}
                </Text>

                {type === "featured" && <Text style={styles.meta}>{item.length}</Text>}
                {type === "collection" && <Text style={styles.meta}>{item.size}</Text>}
                {type === "single" && <Text style={styles.meta}>{item.length}</Text>}
            </View>
        </TouchableOpacity>
    );
};

export default MediaCard;

const styles = StyleSheet.create({
    card: {
        width: 160,
        marginRight: 14,
        borderRadius: 12,
        overflow: "hidden",
        backgroundColor: "#1e1e1ea7",
    },
    collectionCard: {
        width: 200, // collections are wider
    },
    singleCard: {
        width: 210,
        flexDirection: 'row',
        alignItems:'center',
    },

    image: {
        width: "100%",
        height: 120,
        borderRadius: 12,
    },
    collectionImage: {
        height: 100,
    },
    singleImage: {
        width: 75,
        height: 75,
    },

    textContainer: {
        paddingVertical: 8,
        paddingHorizontal: 8,
        alignItems: "flex-start",
    },
    title: {
        fontSize: 14,
        fontWeight: "700",
        color: "#fff",
        marginBottom: 2,
    },
    singleTitle: {
        textAlign: "center",
        width: "100%",
    },
    meta: {
        fontSize: 12,
        color: "#bbb",
    },
});
