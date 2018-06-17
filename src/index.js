// @flow strict

import React from 'react';
import ReactDOM from 'react-dom';
import Main from './Main';
import './indexNormalize.css';
import './indexTheme.css';

let root = document.getElementById('root');
if (!root) throw new Error('Missing root element!');

ReactDOM.render(<Main/>, root);
