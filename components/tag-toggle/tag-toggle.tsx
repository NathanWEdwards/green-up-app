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
                flex: 1,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'white'
            },
            style
        ]}
    >
        <View style={{ width: 200 }}>
            <View
                style={{
                    flex: 1,
                    flexDirection: 'row',
                    justifyContent: 'flex-start',
                    alignItems: 'center'
                }}
            >
                <MaterialCommunityIcons
                    name={
                        (drop.tags || []).includes(tag)
                            ? 'circle-slice-8'
                            : 'circle-outline'
                    }
                    size={30}
                />
                <Text style={{ textAlign: 'left', marginLeft: 20 }}>
                    {text}
                </Text>
            </View>
        </View>
    </TouchableOpacity>
);
