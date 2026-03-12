import colors from "@/constants/colors";
import React from "react";
import { Text as RNText, StyleProp, TextProps, TextStyle } from "react-native";

interface CustomTextProps extends TextProps {
    style?: StyleProp<TextStyle>;
    children?: React.ReactNode;
}

export const Text: React.FC<CustomTextProps> = (props) => {
    const { style, children, ...passThroughProps } = props;
    const defaultTitle: TextStyle = {
        fontSize: 15,
        fontStyle: "normal",
        fontWeight: "normal",
        backgroundColor: colors.transparent,
        fontFamily: "Rubik-Regular",
        textAlign: "left",
        color: colors.textDark,
    };
    return (<RNText {...passThroughProps} style={[defaultTitle, style]}>{children}</RNText>);
};
