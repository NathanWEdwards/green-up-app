import React, { type PropsWithChildren } from "react";
import { Text, type TextStyle, type TextProps } from "react-native";

interface DisplayTextProps extends Omit<TextProps, "style"> {
    style?: TextStyle | TextStyle[];
}

export const DisplayText: React.FC<PropsWithChildren<DisplayTextProps>> = ({
    style,
    children,
    ...passThroughProps
}) => (
    <Text {...passThroughProps} style={[style, { fontFamily: "Rubik-Regular" }]}>
        {children}
    </Text>
);
