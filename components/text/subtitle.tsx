import colors from "@/constants/colors";
import React from "react";
import { StyleProp, Text, TextProps, TextStyle } from "react-native";

interface SubtitleProps extends TextProps {
    style?: StyleProp<TextStyle>;
    children?: React.ReactNode;
}

export const Subtitle: React.FC<SubtitleProps> = (props) => {
    const { style, children, ...passThroughProps } = props;
    const defaultTitle: TextStyle = {
        fontSize: 15,
        lineHeight: 25,
        fontStyle: "normal",
        fontWeight: "normal",
        backgroundColor: colors.transparent,
        fontFamily: "Rubik-Regular",
        textAlign: "center",
        color: colors.white,
    };
    return (<Text {...passThroughProps} style={[defaultTitle, style]}>{children}</Text>);
};
