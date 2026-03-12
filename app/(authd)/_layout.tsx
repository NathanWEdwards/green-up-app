import { Stack } from 'expo-router';
import React from 'react';

import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
    const colorScheme = useColorScheme();

    return (
        <Stack>
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
                name="record-trash"
                options={{
                    title: 'Record Trash'
                }}
            />
            <Stack.Screen
                name="trash-map"
                options={{
                    title: 'Trash Map'
                }}
            />
            {/* Stack-navigable screens hidden from tab bar */}
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
                name="towns"
                options={{
                    title: 'Towns'
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
