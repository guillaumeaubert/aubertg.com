// @flow strict

import React from 'react';
import Display from './Display';
import renderer from 'react-test-renderer';

it('The component renders correctly', () => {
  const tree = renderer.create(
    <Display text="DEVASTATING" transformation="square" />
  ).toJSON();
  expect(tree).toMatchSnapshot();
});
