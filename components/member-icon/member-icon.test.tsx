import React from 'react';
import 'react-native';
import renderer from 'react-test-renderer';
import MemberIcon from './index';

it('renders correctly', () => {
    const tree = renderer
        .create(<MemberIcon memberStatus="INVITED" />)
        .toJSON();
    expect(tree).toMatchSnapshot();
});
