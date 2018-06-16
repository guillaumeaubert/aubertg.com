import React from 'react';
import Controls from './VerticalTextGenerator/Controls';
import Display from './VerticalTextGenerator/Display';

class VerticalTextGenerator extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      text: this.props.text,
      transformation: this.props.transformation,
    };

    this.handleTextChange = this.handleTextChange.bind(this);
    this.handleTransformationChange = this.handleTransformationChange.bind(this);
  }

  componentDidMount() {
    document.title = 'Vertical Text Generator';
  }

  handleTextChange(text) {
    this.setState({
      text: text,
    });
  }

  handleTransformationChange(transformation) {
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
