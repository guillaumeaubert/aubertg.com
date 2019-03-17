// @flow strict

import type { Node } from 'react';

import React, { useState, useEffect } from 'react';
import './Badge.css';
import loader from '../images/loading-spin.gif';

const Badge = (
  {
    link,
    image,
    text,
    defaultWidth,
  }: {|
    +link: string,
    +image: string,
    +text: string,
    +defaultWidth: number,
  |}
): Node => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  useEffect(() => {
    let imageLoader = new Image();
    imageLoader.src = image;
    imageLoader.onload = () => {
      setIsImageLoaded(true);
    };
  });

  let content = null;
  if (isImageLoaded) {
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
    <div className="badge">
      {content}
    </div>
  );
};

export default Badge;
