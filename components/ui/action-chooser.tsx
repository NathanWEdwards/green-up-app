import { useState } from "react";
import { StyleSheet } from 'react-native';
import DropDownPicker from "react-native-dropdown-picker";
import { useAction } from "../providers/action-provider";

const choices = [
    { label: "get supplies", value: "supplies" },
    { label: "view dropoff locations", value: "collection" },
    { label: "view city/town details", value: "details" },
    { label: "join a team", value: "team" },
]

export default function ActionChooser() {
    const [items, setItems] = useState<{ label: string; value: string; }[]>(choices);
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState(null);
    const { action, setAction } = useAction();


    return (
        <DropDownPicker
                testID="collection-picker"
                placeholder="Select"
                open={open}
                value={value}
                items={items}
                setOpen={setOpen}
                setValue={state => {
                    setValue(state);
                    setAction(value);
                }}
                setItems={setItems}
                containerStyle={styles.container}
                style={styles.picker}
                dropDownContainerStyle={styles.dropDownContainer}
                textStyle={styles.text}
                placeholderStyle={styles.placeholder}
                selectedItemLabelStyle={styles.selectedItem}
                listMode="FLATLIST"
        />
    );
}

const styles = StyleSheet.create({
    container: {
        height: 48,
    },
    picker: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingHorizontal: 10,
        borderWidth: 0,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
    },
    dropDownContainer: {
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        borderWidth: 0,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 4,
    },
    text: {
        color: '#111827',
        fontSize: 15,
    },
    placeholder: {
        color: '#6B7280',
    },
    selectedItem: {
        fontWeight: '600',
    },
});