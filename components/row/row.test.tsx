import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Platform } from 'react-native';
import { Row } from './row';

describe('Row Component', () => {
    it('renders title correctly', () => {
        const { getByText } = render(<Row title="Test Row" onPress={() => {}} />);
        expect(getByText('Test Row')).toBeTruthy();
    });

    it('handles onPress event', () => {
        const onPressMock = jest.fn();
        const { getByText } = render(<Row title="Clickable Row" onPress={onPressMock} />);
        
        fireEvent.press(getByText('Clickable Row'));
        expect(onPressMock).toHaveBeenCalledTimes(1);
    });

    it('renders empty View when platform prop does not match current Platform.OS', () => {
        // Platform.OS defaults to 'ios' or 'android' in standard Jest environments.
        // Assuming it's NOT 'web':
        const mismatchPlatform = Platform.OS === 'ios' ? 'android' : 'ios';
        
        const { queryByText } = render(
            <Row title="Hidden Title" onPress={() => {}} platform={mismatchPlatform} />
        );
        
        expect(queryByText('Hidden Title')).toBeNull();
    });

    it('renders correctly when platform prop matches current Platform.OS', () => {
        const { getByText } = render(
            <Row title="Visible Title" onPress={() => {}} platform={Platform.OS} />
        );
        
        expect(getByText('Visible Title')).toBeTruthy();
    });
});
