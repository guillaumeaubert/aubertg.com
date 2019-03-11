// @flow strict

import React from 'react';
import githubIcon from './images/font-awesome_4-6-3_github_32_0_ffffff_none.png';
import linkedinIcon from './images/brandico_2014-04-07_linkedin-rect_32_0_ffffff_none.png';
import envelopeIcon from './images/font-awesome_4-6-3_envelope-square_32_0_ffffff_none.png';
import './ContactInfo.css';

type Props = {||};

class ContactInfo extends React.Component<Props> {
  render() {
    return (
      <div id="contact-info">
        <ul>
          <li>
            Find me on:
          </li>
          <li>
            <a href="https://github.com/guillaumeaubert/">
              <img src={githubIcon} alt="Github"/>
            </a>
          </li>
          <li>
            <a href="https://www.linkedin.com/in/aubertguillaume">
              <img src={linkedinIcon} alt="LinkedIn"/>
            </a>
          </li>
          <li>
            <a href="mailto:me@aubertg.com">
              <img src={envelopeIcon} alt="Email"/>
            </a>
          </li>
        </ul>
      </div>
    );
  }
}

export default ContactInfo;
