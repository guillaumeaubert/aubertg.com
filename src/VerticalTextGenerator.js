// @flow strict

import React from 'react';
import Controls from './VerticalTextGenerator/Controls';
import Display from './VerticalTextGenerator/Display';

type Props = {|
  +text: string,
  +transformation: string,
|};

type State = {|
  text: string,
  transformation: string,
|};

class VerticalTextGenerator extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      text: this.props.text,
      transformation: this.props.transformation,
    };

    (this: any).handleTextChange = this.handleTextChange.bind(this);
    (this: any).handleTransformationChange = this.handleTransformationChange.bind(this);
  }

  componentDidMount() {
    document.title = 'Vertical Text Generator';
  }

  handleTextChange(text: string) {
    this.setState({
      text: text,
    });
  }

  handleTransformationChange(transformation: string) {
    this.setState({
      transformation: transformation,
    });
  }

  render() {
    return (
      <section>
        <h1>A vertical text generator...</h1>
        <Controls
          text={this.state.text}
          transformation={this.state.transformation}
          onTextChange={this.handleTextChange}
          onTransformationChange={this.handleTransformationChange}
        />
        <Display
          text={this.state.text}
          transformation={this.state.transformation}
        />
      </section>
    );
  }
}

export default VerticalTextGenerator;
