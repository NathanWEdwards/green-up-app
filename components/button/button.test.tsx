import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';
import { PrimaryButton, SecondaryButton } from './button';

describe('Button Components', () => {
    describe('PrimaryButton', () => {
        it('renders correctly with children', () => {
            const { getByText } = render(
                <PrimaryButton>
                    <Text>Click Me</Text>
                </PrimaryButton>
            );
            expect(getByText('Click Me')).toBeTruthy();
        });

        it('handles onPress event', () => {
            const onPressMock = jest.fn();
            const { getByText } = render(
                <PrimaryButton onPress={onPressMock}>
                    <Text>Submit</Text>
                </PrimaryButton>
            );
            
            fireEvent.press(getByText('Submit'));
            expect(onPressMock).toHaveBeenCalledTimes(1);
        });

        it('applies custom styles', () => {
            const { getByTestId } = render(
                <PrimaryButton testID="primary-btn" style={{ backgroundColor: 'red' }} />
            );
            
            const button = getByTestId('primary-btn');
            expect(button.props.style).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ backgroundColor: 'red' })
                ])
            );
        });
    });

    describe('SecondaryButton', () => {
        it('renders correctly with children', () => {
            const { getByText } = render(
                <SecondaryButton>
                    <Text>Cancel</Text>
                </SecondaryButton>
            );
            expect(getByText('Cancel')).toBeTruthy();
        });

        it('handles onPress event', () => {
            const onPressMock = jest.fn();
            const { getByText } = render(
                <SecondaryButton onPress={onPressMock}>
                    <Text>Back</Text>
                </SecondaryButton>
            );
            
            fireEvent.press(getByText('Back'));
            expect(onPressMock).toHaveBeenCalledTimes(1);
        });
    });
});
