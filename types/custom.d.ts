declare module 'react-native-autocomplete-input' {
    import React from 'react';
    import { StyleProp, TextInputProps, ViewStyle } from 'react-native';

    interface AutocompleteProps extends TextInputProps {
        data?: any[];
        defaultValue?: string;
        onShowResults?: (showResults: boolean) => void;
        renderItem?: (item: any) => React.ReactElement;
        renderTextInput?: (props: TextInputProps) => React.ReactElement;
        containerStyle?: StyleProp<ViewStyle>;
        hideResults?: boolean;
        inputContainerStyle?: StyleProp<ViewStyle>;
        listContainerStyle?: StyleProp<ViewStyle>;
        listStyle?: StyleProp<ViewStyle>;
        flatListProps?: any;
        keyExtractor?: (item: any, index: number) => string;
    }

    const Autocomplete: React.FC<AutocompleteProps>;
    export default Autocomplete;
}

declare module 'md5-hash' {
    function md5(input: string): string;
    export default md5;
}

declare module '*.png' {
    const value: any;
    export default value;
}
