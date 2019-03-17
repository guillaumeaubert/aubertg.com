// @flow strict

import type { Node } from 'react';

import React from 'react';
import './Controls.css';

export const TRANSFORMATIONS: Map<string, string> = new Map()
  .set('vertical', 'Vertical')
  .set('vtop', 'V, top')
  .set('vbottom', 'V, bottom')
  .set('square', 'Square')
  .set('plus', 'Plus')
  .set('stairs', 'Stairs')
  .set('slinky', 'Slinky')
  .set('nestedv', 'Nested Vs')
  .set('tree', 'Tree');

const Controls = (
  {
    text,
    transformation,
    onTextChange,
    onTransformationChange,
  }: {|
    +text: string,
    +transformation: string,
    +onTextChange: any,
    +onTransformationChange: any,
  |}
): Node => {
  const handleTextChange = (e: SyntheticInputEvent<EventTarget>): void => {
    onTextChange(e.target.value);
  };

  const handleTransformationChange = (e: SyntheticInputEvent<EventTarget>): void => {
    onTransformationChange(e.target.value);
  };

  return (
    <div id="controls">
      <div>
        <h4>Text:</h4>
        <input
          type="text"
          value={text}
          onChange={handleTextChange}
        />
      </div>
      <div>
        <h4>Transformations:</h4>
        <ul>
          {
            [...TRANSFORMATIONS].map((t) => {
              let key = t[0];
              let value = t[1];
              return (
                <li key={key}>
                  <label>
                    <input
                      type="radio"
                      name="style"
                      value={key}
                      checked={transformation === key}
                      onChange={handleTransformationChange}
                    />
                    {value}
                  </label>
                </li>
              );
            })
          }
        </ul>
      </div>
    </div>
  );
};

export default Controls;
