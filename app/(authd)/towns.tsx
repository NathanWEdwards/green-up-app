import React, { useState } from 'react';
import {
    FlatList,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    View
} from 'react-native';

import TownItem from '@/components/town-item';
import { defaultStyles } from '@/styles/default-styles';
import { selectTownData } from '@/store/slices/townsSlice';
import { useAppSelector } from '@/store/hooks';

const styles = StyleSheet.create(defaultStyles as any);

interface Town {
    id?: string;
    name?: string;
    [key: string]: any;
}

const TownInfo: React.FC = () => {
    const towns = useAppSelector(selectTownData) as Record<string, Town>;
    const [searchResults, setSearchResults] = useState<string[]>(
        Object.keys(towns)
    );
    const [searchTerm, setSearchTerm] = useState('');

    const onSearchTermChange = (term: string) => {
        const trimmed = term.trim().toLowerCase();
        const filtered = Object.values(towns)
            .filter((town: Town) =>
                (town.name || '').toLowerCase().includes(trimmed)
            )
            .map((town: Town) => town.id)
            .filter((id): id is string => Boolean(id));

        setSearchResults(filtered);
        setSearchTerm(term.trim());
    };

    const keys = searchTerm ? searchResults : Object.keys(towns);
    const locations = keys.map((key: string) => ({
        key,
        ...(towns[key] || {})
    }));

    return (
        <View style={styles.frame}>
            <View style={{ margin: 10 }}>
                <TextInput
                    keyboardType="default"
                    onChangeText={onSearchTermChange}
                    placeholder="Search by City/Town"
                    style={styles.textInput}
                    value={searchTerm}
                    underlineColorAndroid="transparent"
                />
            </View>
            <KeyboardAvoidingView
                style={defaultStyles.frame as any}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView style={styles.scroll}>
                    <View style={styles.infoBlockContainer}>
                        <FlatList
                            style={styles.infoBlockContainer}
                            data={locations}
                            renderItem={({ item }: { item: Town }) => (
                                <TownItem item={item} />
                            )}
                        />
                    </View>
                    <View style={defaultStyles.padForIOSKeyboard as any} />
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

export default TownInfo;
