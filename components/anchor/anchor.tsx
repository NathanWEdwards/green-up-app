import React from "react";
import { Linking, Text, TextProps } from "react-native";

interface AnchorProps extends TextProps {
    children?: React.ReactNode;
    href: string;
    onPress?: () => void;
}

export const Anchor: React.FC<AnchorProps> = (props) => {
    const { children, href, onPress, ...rest } = props;
    const _handlePress = () => {
        Linking.openURL(href);
        if (onPress) {
            onPress();
        }
    };
    return (
        <Text {...rest} onPress={_handlePress}>
            {children}
        </Text>
    );
};

export default Anchor;
