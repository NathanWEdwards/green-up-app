import colors from "@/constants/colors";
import Ionicons from '@expo/vector-icons/Ionicons';
import React from "react";

interface TabBarIconProps {
    focused: boolean;
    name: React.ComponentProps<typeof Ionicons>['name'];
}

export const TabBarIcon: React.FC<TabBarIconProps> = ({ focused, name }) => (
    <Ionicons
        name={name}
        size={26}
        style={{ marginBottom: -3 }}
        color={focused ? colors.tabIconSelected : colors.tabIconDefault}
    />
);