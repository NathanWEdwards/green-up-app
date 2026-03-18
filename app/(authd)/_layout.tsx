import { Stack } from 'expo-router';
import React from 'react';

import * as constants from '@/styles/constants';

export default function TabLayout() {
    return (
        <Stack
            screenOptions={{
                headerStyle: {
                    backgroundColor: constants.colorBackgroundDark
                },
                headerTintColor: constants.colorTextThemeLight,
                headerTitleStyle: {
                    fontWeight: 'bold'
                },
                contentStyle: {
                    backgroundColor: constants.colorBackgroundDark
                }
            }}
        >
            <Stack.Screen
                name="index"
                options={{
                    title: 'Home'
                }}
            />
            <Stack.Screen
                name="find-team"
                options={{
                    title: 'Find Team'
                }}
            />
            <Stack.Screen
                name="free-supplies"
                options={{
                    title: 'Free Supplies'
                }}
            />
            <Stack.Screen
                name="record-trash"
                options={{
                    title: 'Record Trash'
                }}
            />
            <Stack.Screen
                name="new-team"
                options={{
                    title: 'Start a Team'
                }}
            />
            <Stack.Screen
                name="team-details"
                options={{
                    title: 'Team Details'
                }}
            />
            <Stack.Screen
                name="team-editor"
                options={{
                    title: 'Team Editor'
                }}
            />
            <Stack.Screen
                name="town-information"
                options={{
                    title: 'Town Information'
                }}
            />
            <Stack.Screen
                name="towns"
                options={{
                    title: 'Towns'
                }}
            />
            <Stack.Screen
                name="trash-map"
                options={{
                    title: 'Trash Map'
                }}
            />
            <Stack.Screen
                name="trash-disposal"
                options={{
                    title: 'Trash Drop Locations'
                }}
            />
            <Stack.Screen
                name="greenup-facts"
                options={{
                    title: 'Green Up Facts'
                }}
            />
        </Stack>
    );
}
