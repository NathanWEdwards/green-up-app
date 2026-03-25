import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from './text';

describe('Text Component', () => {
    it('renders correctly with children', () => {
        const { getByText } = render(<Text>Hello World</Text>);
        expect(getByText('Hello World')).toBeTruthy();
    });

    it('applies default styles', () => {
        const { getByText } = render(<Text>Default Styles</Text>);
        const textElement = getByText('Default Styles');
        
        expect(textElement.props.style).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    fontSize: 15,
                    fontStyle: 'normal',
                    fontWeight: 'normal',
                    fontFamily: 'Rubik-Regular',
                    textAlign: 'left'
                })
            ])
        );
    });

    it('merges custom styles', () => {
        const { getByText } = render(
            <Text style={{ fontSize: 20, color: 'blue' }}>Custom Styles</Text>
        );
        const textElement = getByText('Custom Styles');
        
        expect(textElement.props.style).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    fontSize: 20,
                    color: 'blue'
                })
            ])
        );
    });
});
