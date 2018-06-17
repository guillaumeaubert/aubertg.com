// @flow strict

import React from 'react';
import ContactInfo from './ContactInfo';
import renderer from 'react-test-renderer';

it('The component renders correctly', () => {
  const tree = renderer.create(
    <ContactInfo />
  ).toJSON();
  expect(tree).toMatchSnapshot();
});
