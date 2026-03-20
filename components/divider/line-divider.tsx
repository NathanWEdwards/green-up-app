import colors from '@/constants/colors';
import React from 'react';
import { StyleProp, View, ViewProps, ViewStyle } from 'react-native';

interface LineDividerProps extends ViewProps {
    style?: StyleProp<ViewStyle>;
}

export const LineDivider: React.FC<LineDividerProps> = (props) => {
    const { style, ...passThroughProps } = props;
    const dividerStyle = {
        ...(style as Record<string, any>),
        borderBottomColor: colors.backgroundLight,
        borderTopWidth: 0,
        borderBottomWidth: 0.5,
        margin: 2
    };
    return <View {...passThroughProps} style={[dividerStyle]}></View>;
};
