import colors from '@/constants/colors';
import React from 'react';
import { Text as RNText, StyleProp, TextProps, TextStyle } from 'react-native';

interface CaptionProps extends TextProps {
    style?: StyleProp<TextStyle>;
    children?: React.ReactNode;
}

export const Caption: React.FC<CaptionProps> = (props) => {
    const { style, children, ...passThroughProps } = props;
    const defaultTitle: TextStyle = {
        fontSize: 12,
        lineHeight: 25,
        fontStyle: 'normal',
        fontWeight: 'normal',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        backgroundColor: colors.transparent,
        fontFamily: 'Rubik-Regular',
        textAlign: 'left',
        marginLeft: 15,
        marginRight: 15,
        marginBottom: 0,
        marginTop: 0,
        color: colors.inputText
    };
    return (
        <RNText {...passThroughProps} style={[defaultTitle, style]}>
            {children}
        </RNText>
    );
};
