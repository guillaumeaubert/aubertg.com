// @flow strict

import React from 'react';
import './Controls.css';

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
            <li>
              <label>
                <input
                  type="radio"
                  name="style"
                  value="vertical"
                  checked={transformation === 'vertical'}
                  onChange={this.handleTransformationChange}
                />
                Vertical
              </label>
            </li>
            <li>
              <label>
                <input
                  type="radio"
                  name="style"
                  value="vtop"
                  checked={transformation === 'vtop'}
                  onChange={this.handleTransformationChange}
                />
                V, top
              </label>
            </li>
            <li>
              <label>
                <input
                  type="radio"
                  name="style"
                  value="vbottom"
                  checked={transformation === 'vbottom'}
                  onChange={this.handleTransformationChange}
                />
                V, bottom
              </label>
            </li>
            <li>
              <label>
                <input
                  type="radio"
                  name="style"
                  value="square"
                  checked={transformation === 'square'}
                  onChange={this.handleTransformationChange}
                />
                Square
              </label>
            </li>
            <li>
              <label>
                <input
                  type="radio"
                  name="style"
                  value="plus"
                  checked={transformation === 'plus'}
                  onChange={this.handleTransformationChange}
                />
                Plus
              </label>
            </li>
            <li>
              <label>
                <input
                  type="radio"
                  name="style"
                  value="stairs"
                  checked={transformation === 'stairs'}
                  onChange={this.handleTransformationChange}
                />
                Stairs
              </label>
            </li>
            <li>
              <label>
                <input
                  type="radio"
                  name="style"
                  value="slinky"
                  checked={transformation === 'slinky'}
                  onChange={this.handleTransformationChange}
                />
                Slinky
              </label>
            </li>
            <li>
              <label>
                <input
                  type="radio"
                  name="style"
                  value="nestedv"
                  checked={transformation === 'nestedv'}
                  onChange={this.handleTransformationChange}
                />
                Nested Vs
              </label>
            </li>
            <li>
              <label>
                <input
                  type="radio"
                  name="style"
                  value="tree"
                  checked={transformation === 'tree'}
                  onChange={this.handleTransformationChange}
                />
                Tree
              </label>
            </li>
          </ul>
        </div>
      </div>
    );
  }
}

export default Controls;
