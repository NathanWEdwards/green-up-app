import React from "react";
import { StyleProp, View, ViewProps, ViewStyle } from "react-native";

interface TextDividerProps extends ViewProps {
    style?: StyleProp<ViewStyle>;
    children?: React.ReactNode;
}

export const TextDivider: React.FC<TextDividerProps> = (props) => {
    const { style, children, ...passThroughProps } = props;
    const dividerStyle = {
        border: 0,
        margin: 0,
        padding: 10,
        marginTop: 20,
        marginBottom: 0,
    }
    return (<View {...passThroughProps} style={[dividerStyle, style]}>{children}</View>);
};
