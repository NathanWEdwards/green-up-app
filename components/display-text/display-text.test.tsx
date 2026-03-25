import 'react-native';
import React from 'react';
import DisplayText from './index';
import { render } from '@testing-library/react-native';

it('renders correctly', () => {
    const { toJSON } = render(<DisplayText>Snapshot test! </DisplayText>);
    expect(toJSON()).toMatchSnapshot();
});
