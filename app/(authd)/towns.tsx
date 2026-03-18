import React, { useCallback, useMemo, useState } from 'react';
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
import { useGetAllTownsQuery } from '@/store/apis/townApi';

const styles = StyleSheet.create(defaultStyles as any);

interface Town {
    id?: string;
    name?: string;
    [key: string]: any;
}

const TownInfo: React.FC = () => {
    const { data: towns } = useGetAllTownsQuery(undefined, {
        selectFromResult: (result) => ({
            ...result,
            data: result.data ?? {}
        })
    });
    const [searchTerm, setSearchTerm] = useState('');

    const filteredKeys = useMemo(() => {
        if (!searchTerm) return Object.keys(towns);
        const trimmed = searchTerm.trim().toLowerCase();
        return Object.values(towns)
            .filter((town: Town) =>
                (town.name || '').toLowerCase().includes(trimmed)
            )
            .map((town: Town) => town.id)
            .filter((id): id is string => Boolean(id));
    }, [towns, searchTerm]);

    const locations = useMemo(
        () =>
            filteredKeys.map((key: string) => ({
                key,
                ...(towns[key] || {})
            })),
        [filteredKeys, towns]
    );

    const onSearchTermChange = useCallback((term: string) => {
        setSearchTerm(term.trim());
    }, []);

    const keyExtractor = useCallback((item: Town) => item.key || item.id || '', []);

    const renderItem = useCallback(
        ({ item }: { item: Town }) => <TownItem item={item} />,
        []
    );

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
                            keyExtractor={keyExtractor}
                            renderItem={renderItem}
                        />
                    </View>
                    <View style={defaultStyles.padForIOSKeyboard as any} />
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

export default TownInfo;
