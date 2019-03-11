// @flow strict

import React from 'react';
import './Display.css';

function nest(text, i) {
  if (i === 0) {
    return [];
  }

  let nested = nest(text, i - 1);
  let rows = [text].concat([...text].slice(1));
  if (rows.length < 2) {
    rows[1] = ' ';
  }

  for (let j = 2; j < Math.max(nested.length + 2, rows.length); j++) {
    if (j >= rows.length) {
      rows[j] = ' ';
    }

    if (j < nested.length + 2) {
      rows[j] += '  ' + nested[j - 2];
    }
  }

  return rows;
}

type Props = {|
  +text: string,
  +transformation: string,
|};

class Display extends React.Component<Props> {
  render() {
    let {text, transformation} = this.props;

    let chars = [...text];
    let output = '';
    if (text.length > 0) {
      switch (transformation) {
        case 'vertical': {
          output = chars.join('\n');
          break;
        }
        case 'vtop': {
          output = text + '\n' + chars.slice(1).join('\n');
          break;
        }
        case 'vbottom': {
          let padding = ' '.repeat(chars.length - 1);
          output = chars
            .slice(0, -1)
            .map(x => padding + x)
            .join('\n');
          output += '\n' + text;
          break;
        }
        case 'plus': {
          let intersect = Math.floor((chars.length + 1) / 2);
          let padding = ' '.repeat(intersect - 1);
          let rows = chars.map(x => padding + x);
          rows[intersect - 1] = text;
          output = rows.join('\n');
          break;
        }
        case 'stairs': {
          for (let i = 0; i < 5; i++) {
            let padding = ' '.repeat(i * 3);
            output += padding + text + '\n\n';
          }
          break;
        }
        case 'slinky': {
          let reversed = chars.slice().reverse().join('');
          for (let i = 0; i < 5; i++) {
            let padding = ' '.repeat(i * (chars.length - 1));
            let vtext = chars
              .slice(i === 0 ? 0 : 1, -1)
              .map(x => padding + x)
              .join('\n');
            if (vtext.length > 0) {
              output += vtext + '\n';
            }
            output += padding + reversed + '\n';
          }
          break;
        }
        case 'nestedv': {
          output = nest(text, 5).join('\n');
          break;
        }
        case 'square': {
          if (text.length === 1) {
            output = text;
          } else {
            let padding = ' '.repeat(chars.length - 2);
            output = text + '\n';
            for (let i = 1; i < chars.length - 1; i++) {
              output += chars[i] + padding;
              output += chars.slice(-1 * i - 1, -1 * i).join('') + '\n';
            }
            output += chars.reverse().join('');
          }
          break;
        }
        case 'tree': {
          for (let i = chars.length; i > 0; i--) {
            output += ' '.repeat(chars.length - i)
              + Array(i).fill(chars[i - 1]).join(' ')
              + '\n';
          }
          break;
        }
        default: {
          output = '';
        }
      }
    }
    output = output.replace(/ /g, '\u00a0');
    output = output.split(/\n/).map(
      (row, index) => (
        <div key={`row_${index}`}>
          {row === '' ? '\u00a0' : row}
        </div>
      )
    );

    return (
      <div id="canvas">{output}</div>
    );
  }
}

export default Display;
