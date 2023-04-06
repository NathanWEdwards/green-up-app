/* eslint-disable react/prop-types */
// @flow
import React from "react";
import { Platform } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import TabBarIcon from "../components/tab-bar-icon";
import MenuStack from "./menu-stack";
import MessagesStack from "./messages-stack";
import TrashTrackerStack from "./trash-tracker-stack";
import HomeStack from "./home-stack";
import LeaderboardStack from "./leaderboard-stack";

const BottomTabs = createBottomTabNavigator();

export default function MainTabNavigator() {
    return (
        <BottomTabs.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
            <BottomTabs.Screen
                name="Home"
                component={HomeStack}
                options={{
                    tabBarLabel: "Home",
                    tabBarIcon: ({ focused }) => (
                        <TabBarIcon
                            focused={focused}
                            name={Platform.OS === "ios" ? `ios-home${focused ? "" : ""}` : "md-home"}
                        />
                    )
                }}
            />
            {/*
            <BottomTabs.Screen
                name="Messages"
                options={{
                    tabBarLabel: "Messages",
                    tabBarIcon: ({ focused }) => (
                        <TabBarIcon
                            focused={focused}
                            name={Platform.OS === "ios" ? `ios-chatbubbles${focused ? "" : ""}` : "md-chatbubbles"}
                        />
                    )
                }}
            />
            <BottomTabs.Screen
                name="Leaderboard"
                options={{
                    tabBarLabel: "Leaderboard",
                    tabBarIcon: ({ focused }) => (
                        <TabBarIcon
                            focused={focused}
                            name={Platform.OS === "ios" ? `ios-list-box${focused ? "" : ""}` : "md-list-box"}
                        />
                    )
                }}
            />
            <BottomTabs.Screen
                name="Trash"
                options={{
                    tabBarLabel: "Trash",
                    tabBarIcon: ({ focused }) => (
                        <TabBarIcon
                            focused={focused}
                            name={Platform.OS === "ios" ? `ios-pin${focused ? "" : ""}` : "md-pin"}
                        />
                    )
                }}
            />
            <BottomTabs.Screen
                name="Menu"
                options={{
                    tabBarLabel: "Menu",
                    tabBarIcon: ({ focused }) => (
                        <TabBarIcon focused={focused} name={Platform.OS === "ios" ? "ios-menu" : "md-menu"} />
                    )
                }}
            />
            */}
        </BottomTabs.Navigator>
    );
}
