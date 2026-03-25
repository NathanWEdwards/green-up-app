import React from 'react';
import 'react-native';
import MemberIcon from './index';
import { render } from '@testing-library/react-native';

it('renders correctly', () => {
    const { toJSON } = render(<MemberIcon memberStatus="INVITED" />);
    expect(toJSON()).toMatchSnapshot();
});
