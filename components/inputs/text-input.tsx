import colors from '@/constants/colors';
import { controls } from '@/styles/controls';
import React from 'react';
import {
    TextInput as RNTextInput,
    StyleProp,
    TextInputProps,
    TextStyle
} from 'react-native';

interface CustomTextInputProps extends TextInputProps {
    style?: StyleProp<TextStyle>;
    children?: React.ReactNode;
}

export const TextInput: React.FC<CustomTextInputProps> = (props) => {
    const { style, children, ...passThroughProps } = props;
    const inputStyle = {
        ...controls.textInput,
        ...(style as Record<string, any>)
    };
    return (
        <RNTextInput
            {...passThroughProps}
            placeholderTextColor={colors.placeholderText}
            style={[inputStyle]}
        >
            {children}
        </RNTextInput>
    );
};
