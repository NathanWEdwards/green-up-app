import Town from '@/models/town';
import { defaultStyles } from '@/styles/default-styles';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Autocomplete from 'react-native-autocomplete-input';

const myStyles = {
    autocompleteContainer: {
        flex: 1,
        left: 0,
        position: 'absolute' as const,
        right: 0,
        top: 0,
        zIndex: 1
    },
    labelDark: {
        color: '#333',
        fontSize: 16,
        shadowColor: '#FFF',
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 1,
        shadowRadius: 1,
        marginTop: 5
    },
    suggestion: {
        paddingTop: 10,
        paddingBottom: 10,
        paddingLeft: 5,
        borderColor: '#ABABAB',
        borderBottomWidth: 1
    }
};
const combinedStyles = { ...defaultStyles, ...myStyles };
const styles = StyleSheet.create(combinedStyles as any);

interface TownSelectorProps {
    onSelect: (town: Town) => void;
    value?: string;
    towns?: Town[];
}

const matchTowns = (towns?: Town[], query?: string): Town[] => {
    const testTowns = Array.isArray(towns)
        ? towns.filter((town: Town): boolean => Boolean(town && town.name))
        : [];
    const testString =
        typeof query !== 'string' ? '' : query.trim().toLowerCase();
    return testTowns.filter((town: Town): boolean =>
        (town.name || '').toLowerCase().startsWith(testString)
    );
};

interface AutocompleteSelection {
    item: Town;
}

export const TownSelector: React.FC<TownSelectorProps> = ({
    value,
    towns,
    onSelect
}) => {
    const [query, setQuery] = useState('');
    const [focus, setFocus] = useState(false);
    const data = focus ? matchTowns(towns, query) : [];
    useEffect(() => {
        if (Boolean(value)) {
            setQuery(value || '');
        }
    }, [value]);
    return (
        <View style={{ zIndex: 1, marginTop: 10 }}>
            <Text style={styles.label}>{'Select Town/City'}</Text>
            <Autocomplete
                inputContainerStyle={{
                    padding: 10,
                    backgroundColor: 'white'
                }}
                data={data}
                defaultValue={query}
                onChangeText={setQuery}
                onBlur={() => {
                    setFocus(false);
                }}
                onFocus={() => {
                    setFocus(true);
                }}
                keyExtractor={(item: Town): string => item.id || ''}
                underlineColorAndroid={'transparent'}
                renderItem={(
                    selection: AutocompleteSelection
                ): React.ReactElement => (
                    <TouchableOpacity
                        key={selection.item.id}
                        style={styles.suggestion}
                        onPress={() => {
                            onSelect(selection.item);
                        }}
                    >
                        <Text style={{ color: 'black' }}>
                            {selection.item.name}
                        </Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
};

export default TownSelector;
