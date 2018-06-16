import React from 'react';
import './Badge.css';
import loader from '../images/loading-spin.gif';

class Badge extends React.Component {
  constructor(props) {
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
    let {link, image, text} = this.props;

    let content = null;
    if (this.state.isImageLoaded) {
      content = (
        <a href={link} key={link}>
          <img src={image} title={text} alt={text}/>
        </a>
      );
    } else {
      content = (
        <div className="loading" style={{width: this.props.defaultWidth}}>
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
