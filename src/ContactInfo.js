import React from 'react';

class ContactInfo extends React.Component {
  render() {
    return (
      <div id="banner">
        <ul>
          <li>
            Find me on:
          </li>
          <li>
            <a href="https://github.com/guillaumeaubert/">
              <img src="/images/font-awesome_4-6-3_github_32_0_ffffff_none.png" alt="Github"/>
            </a>
          </li>
          <li>
            <a href="https://www.linkedin.com/in/aubertguillaume">
              <img src="/images/brandico_2014-04-07_linkedin-rect_32_0_ffffff_none.png" alt="LinkedIn"/>
            </a>
          </li>
          <li>
            <a href="mailto:me@aubertg.com">
              <img src="/images/font-awesome_4-6-3_envelope-square_32_0_ffffff_none.png" alt="Email"/>
            </a>
          </li>
        </ul>
      </div>
    );
  }
}

export default ContactInfo;
