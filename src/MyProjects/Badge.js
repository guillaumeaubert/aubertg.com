// @flow strict

import React from 'react';
import './Badge.css';
import loader from '../images/loading-spin.gif';

type Props = {|
  +link: string,
  +image: string,
  +text: string,
  +defaultWidth: number,
|};

type State = {
  isImageLoaded: boolean,
};

class Badge extends React.Component<Props, State> {
  container: ?HTMLDivElement;

  constructor(props: Props) {
    super(props);

    this.state = {
      isImageLoaded: false,
    };
  }

  componentDidMount() {
    let imageLoader = new Image();
    imageLoader.src = this.props.image;
    imageLoader.onload = () => {
      this.setState({ isImageLoaded: true });
    };
  }

  render() {
    let {link, image, text, defaultWidth} = this.props;

    let content = null;
    if (this.state.isImageLoaded) {
      content = (
        <a href={link} key={link}>
          <img src={image} title={text} alt={text}/>
        </a>
      );
    } else {
      content = (
        <div className="loading" style={{width: defaultWidth}}>
          <img
            src={loader}
            alt='Loading...'
          />
        </div>
      );
    }

    return (
      <div className="badge" ref={(elem) => { this.container = elem; }}>
        {content}
      </div>
    );
  }
}

export default Badge;
