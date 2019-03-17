// @flow strict

import React from 'react';
import Display from './Display';
import renderer from 'react-test-renderer';
import {TRANSFORMATIONS} from './Controls';

for (let transformation of TRANSFORMATIONS) {
  it('The component renders "' + transformation[1] + '" correctly', () => {
    const tree = renderer.create(
      <Display text="DEVASTATING" transformation={transformation[0]} />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });
}
