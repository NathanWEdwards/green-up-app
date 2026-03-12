import * as constants from "@/styles/constants";
import { SimpleLineIcons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface PickupItem {
    townName?: string;
    name?: string;
}

interface PickupLocationProps {
    item: PickupItem;
    onClick: () => void;
}

export const PickupLocation: React.FC<PickupLocationProps> = ({ item, onClick }) => (
    <TouchableOpacity onPress={onClick}>
        <View style={
            {
                flex: 1,
                flexDirection: "row",
                borderBottomWidth: 1,
                borderColor: constants.colorBackgroundDark,
                paddingTop: 10,
                paddingBottom: 10
            }
        }>
            <View style={{
                flex: 1,
                flexDirection: "column",
                padding: 5,
                justifyContent: "center",
                alignItems: "center"
            }}>
                <Text style={{
                    textAlign: "center",
                    fontWeight: "bold",
                    color: "#111",
                    fontSize: 18,
                    fontFamily: "Rubik-Regular"
                }}>
                    {item.townName || ""}
                </Text>
                {
                    <View>
                        <Text style={{
                            textAlign: "center",
                            fontWeight: "bold",
                            color: "#111",
                            fontSize: 16,
                            fontFamily: "Rubik-Regular"
                        }}>
                            {item.name || ""}
                        </Text>
                    </View>
                }
            </View>
            <View>
                <View style={{ flex: 1, justifyContent: "center", marginLeft: 20, marginRight: 10 }}>
                    <SimpleLineIcons
                        name={"arrow-right"}
                        size={20}
                        color="#333"
                    />
                </View>
            </View>
        </View>
    </TouchableOpacity>
);

export default PickupLocation;
