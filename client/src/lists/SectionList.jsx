import React, { useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import MediaCard from "../components/MediaCard";

const SectionList = ({ section }) => {
    const renderCard = useCallback(
        ({ item }) => <MediaCard item={item} type={section.type} />,
        [section.type]
    );

    return (
        <View style={styles.section}>
            <View style={styles.headerRow}>
                <Text style={styles.sectionTitle}>{section.listName}</Text>
                <TouchableOpacity style={styles.seeMore}>
                    <Text style={styles.seeMoreText}>See More</Text>
                    <Icon name="chevron-right" size={16} color="#fff" />
                </TouchableOpacity>
            </View>

            <FlatList
                data={section.data}
                keyExtractor={(i) => String(i._id)}
                renderItem={renderCard}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.rowContent}
            />
        </View>
    );
}

export default SectionList;

const styles = StyleSheet.create({
    section: { marginBottom: 28 },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    sectionTitle: { fontSize: 18, fontWeight: "600", color: "#fff" },
    seeMore: { flexDirection: "row", alignItems: "center" },
    seeMoreText: { color: "#fff", marginRight: 4 },

    rowContent: { paddingHorizontal: 16 },
});
