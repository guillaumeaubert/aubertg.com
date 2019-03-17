// @flow strict

import type { Node } from 'react';

import React, { useState, useEffect } from 'react';
import Controls from './VerticalTextGenerator/Controls';
import Display from './VerticalTextGenerator/Display';

const VerticalTextGenerator = (
  {
    text,
    transformation,
  }: {|
    +text: string,
    +transformation: string,
  |}
): Node => {
  const [currentText, setCurrentText] = useState(text);
  const [currentTransformation, setCurrentTransformation] = useState(transformation);

  useEffect(() => {
    document.title = 'Vertical Text Generator';
  });

  return (
    <section>
      <h1>A vertical text generator...</h1>
      <Controls
        text={currentText}
        transformation={currentTransformation}
        onTextChange={setCurrentText}
        onTransformationChange={setCurrentTransformation}
      />
      <Display
        text={currentText}
        transformation={currentTransformation}
      />
    </section>
  );
};

export default VerticalTextGenerator;
