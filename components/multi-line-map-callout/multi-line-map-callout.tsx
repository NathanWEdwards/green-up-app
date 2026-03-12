import React from 'react';
import { Text, View } from 'react-native';
import { Callout } from 'react-native-maps';

interface MultiLineMapCalloutProps {
    title: string;
    description: string;
    onPress?: () => void;
}

export const MultiLineMapCallout: React.FC<MultiLineMapCalloutProps> = ({
    title,
    description,
    onPress
}) => (
    <Callout onPress={onPress}>
        <View style={{ padding: 1 }}>
            <Text style={{ fontWeight: 'bold', textAlign: 'center' }}>
                {title}
            </Text>
            <Text style={{ minWidth: 100, maxWidth: 250 }} numberOfLines={5}>
                {description}
            </Text>
        </View>
    </Callout>
);

export default MultiLineMapCallout;
