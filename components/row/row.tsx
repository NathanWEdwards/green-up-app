import React from "react";
import { Platform, StyleSheet, Text, TouchableHighlight, View } from "react-native";

const styles = StyleSheet.create({
    row: {
        height: 48,
        paddingHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        borderBottomWidth: 1,
        borderBottomColor: "rgba(0, 0, 0, 0.054)"
    },
    text: {
        fontSize: 16
    }
});

interface RowProps {
    title: string;
    onPress: (a: any) => void;
    platform?: string;
    testID?: string;
}

export const Row: React.FC<RowProps> = ({ title, onPress, platform, testID }) => (
    (platform && platform !== Platform.OS)
        ? (<View />)
        : (
            <TouchableHighlight
                onPress={onPress}
                testID={testID}
                underlayColor={"rgba(0, 0, 0, 0.054)"}
            >
                <View style={styles.row}>
                    <Text style={styles.text}>{title}</Text>
                </View>
            </TouchableHighlight>
        )
);

export default Row;
