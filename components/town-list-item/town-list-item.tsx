import { SimpleLineIcons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity } from 'react-native';

interface TownListItemProps {
    town: { townName: string };
    onClick: () => void;
}

export const TownListItem: React.FC<TownListItemProps> = ({
    town,
    onClick
}) => (
    <TouchableOpacity
        onPress={onClick}
        style={{
            flex: 1,
            flexDirection: 'row',
            borderBottomWidth: 1,
            borderColor: '#AAA',
            padding: 20,
            justifyContent: 'flex-start'
        }}
    >
        <Text
            style={{
                textAlign: 'center',
                fontWeight: 'bold',
                color: '#111',
                fontSize: 20,
                fontFamily: 'Rubik-Regular',
                flexGrow: 1
            }}
        >
            {town.townName || ''}
        </Text>
        <SimpleLineIcons name={'arrow-right'} size={20} color="#333" />
    </TouchableOpacity>
);
