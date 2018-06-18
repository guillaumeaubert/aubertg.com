// @flow strict

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

type Props = {
  text: string,
  transformation: string,
  onTextChange: any,
  onTransformationChange: any,
};

class Controls extends React.Component<Props> {
  handleTextChange: any;
  handleTransformationChange: any;

  constructor(props: Props) {
    super(props);
    this.handleTextChange = this.handleTextChange.bind(this);
    this.handleTransformationChange = this.handleTransformationChange.bind(this);
  }

  handleTextChange(e: SyntheticInputEvent<EventTarget>) {
    this.props.onTextChange(e.target.value);
  }

  handleTransformationChange(e: SyntheticInputEvent<EventTarget>) {
    this.props.onTransformationChange(e.target.value);
  }

  render() {
    let {text, transformation} = this.props;


    return (
      <div id="controls">
        <div>
          <h4>Text:</h4>
          <input
            type="text"
            value={text}
            onChange={this.handleTextChange}
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
                        onChange={this.handleTransformationChange}
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
  }
}

export default Controls;
