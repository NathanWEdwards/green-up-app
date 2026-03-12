import React from "react";
import { Linking, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as constants from "@/styles/constants";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 30,
        backgroundColor: constants.colorBackgroundDark,
    },
    icon: {
        marginBottom: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        color: "white",
        fontFamily: "Rubik-Regular",
        textAlign: "center",
        marginBottom: 10,
    },
    message: {
        fontSize: 16,
        color: "#CCC",
        fontFamily: "Rubik-Regular",
        textAlign: "center",
        marginBottom: 20,
        lineHeight: 22,
    },
    button: {
        backgroundColor: constants.colorBackgroundHeader,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
        fontFamily: "Rubik-Regular",
    },
});

interface EnableLocationServicesProps {
    errorMessage?: string;
}

export const EnableLocationServices: React.FC<EnableLocationServicesProps> = ({
    errorMessage,
}) => {
    const openSettings = () => {
        if (Platform.OS === "ios") {
            Linking.openURL("app-settings:");
        } else {
            Linking.openSettings();
        }
    };

    return (
        <View style={styles.container}>
            <Ionicons
                name="location-outline"
                size={64}
                color="#CCC"
                style={styles.icon}
            />
            <Text style={styles.title}>Location Services Disabled</Text>
            <Text style={styles.message}>
                {errorMessage ||
                    "This feature requires access to your location. Please enable location services in your device settings."}
            </Text>
            <TouchableOpacity style={styles.button} onPress={openSettings}>
                <Text style={styles.buttonText}>Open Settings</Text>
            </TouchableOpacity>
        </View>
    );
};

export default EnableLocationServices;
