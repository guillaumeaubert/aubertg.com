import React from 'react';
import {
  Route,
  NavLink,
  HashRouter
} from 'react-router-dom';
import Projects from './Projects';
import GitStats from './GitStats';
import ContactInfo from './ContactInfo';
import VerticalTextGenerator from './VerticalTextGenerator';

class Main extends React.Component {
  render() {
    return (
      <HashRouter>
        <div>
          <div id="header_wrap" className="outer">
            <header className="inner">
              <ContactInfo />

              <h1 id="project_title">Guillaume Aubert</h1>
              <section id="menu">
                <NavLink exact to="/">
                  <span className="bullet">&#9700;</span>
                  My Projects
                </NavLink>
                <NavLink to="/git-contributions-statistics">
                  <span className="bullet">&#9700;</span>
                  Git Contribution Statistics
                </NavLink>
                <NavLink to="/vertical-text-generator">
                  <span className="bullet">&#9700;</span>
                  Vertical Text Generator
                </NavLink>
              </section>
            </header>
          </div>
          <div id="main_content_wrap" className="outer">
            <section id="main_content" className="inner">
              <div className="content">
                <Route
                  exact path="/"
                  render={(props) => <Projects {...props} githubUser='guillaumeaubert' dockerhubUser='aubertg'/>}
                />
                <Route
                  path="/git-contributions-statistics"
                  component={GitStats}
                />
                <Route
                  path="/vertical-text-generator"
                  render={(props) => <VerticalTextGenerator {...props} text="DEVASTATING" transformation="square"/>}
                />
              </div>
            </section>
          </div>
        </div>
      </HashRouter>
    );
  }
}

export default Main;