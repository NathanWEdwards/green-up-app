import { buttons } from '@/styles/buttons';
import React from 'react';
import { Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';

interface ButtonProps extends PressableProps {
    style?: StyleProp<ViewStyle>;
    children?: React.ReactNode;
}

export const PrimaryButton: React.FC<ButtonProps> = (props) => {
    const { style, children, ...passThroughProps } = props;
    const buttonStyle = {
        ...buttons.primaryButton,
        ...(style as Record<string, any>)
    };
    return (
        <Pressable {...passThroughProps} style={[buttonStyle]}>
            {children}
        </Pressable>
    );
};

export const SecondaryButton: React.FC<ButtonProps> = (props) => {
    const { style, children, ...passThroughProps } = props;
    const buttonStyle = {
        ...buttons.secondaryButton,
        ...(style as Record<string, any>)
    };
    return (
        <Pressable {...passThroughProps} style={[buttonStyle]}>
            {children}
        </Pressable>
    );
};
