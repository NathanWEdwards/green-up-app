import { Text } from '@/components/text';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleProp, TouchableOpacity, View, ViewStyle } from 'react-native';

interface TrashDrop {
    tags?: string[];
}

interface TagToggleProps {
    tag: string;
    text: string;
    onToggle: (tag: string) => void;
    drop: TrashDrop;
    style?: StyleProp<ViewStyle>;
}

export const TagToggle: React.FC<TagToggleProps> = ({
    tag,
    drop,
    text,
    onToggle,
    style = {}
}) => (
    <TouchableOpacity
        onPress={() => onToggle(tag)}
        style={[
            {
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 10,
                paddingHorizontal: 12,
                backgroundColor: 'white'
            },
            style
        ]}
    >
        <MaterialCommunityIcons
            name={
                (drop.tags || []).includes(tag)
                    ? 'circle-slice-8'
                    : 'circle-outline'
            }
            size={28}
            color={(drop.tags || []).includes(tag) ? '#55683A' : '#999'}
        />
        <Text style={{ textAlign: 'left', marginLeft: 14, fontSize: 15 }}>
            {text}
        </Text>
    </TouchableOpacity>
);

