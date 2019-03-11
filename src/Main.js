// @flow strict

import type { Node } from 'react';

import React from 'react';
import {
  Route,
  NavLink,
  HashRouter
} from 'react-router-dom';
import MyProjects from './MyProjects';
import GitStats from './GitStats';
import ContactInfo from './ContactInfo';
import VerticalTextGenerator from './VerticalTextGenerator';
import './Main.css';

const Main = (): Node => {
  return (
    <HashRouter>
      <div>
        <div id="header_wrap" className="outer">
          <header className="inner">
            <ContactInfo />

            <h1>Guillaume Aubert</h1>
            <section id="menu">
              <NavLink exact to="/">
                <span className="bullet">&#9700;&nbsp;</span>
                My Projects
              </NavLink>
              <NavLink to="/git-contributions-statistics">
                <span className="bullet">&#9700;&nbsp;</span>
                Git Contribution Statistics
              </NavLink>
              <NavLink to="/vertical-text-generator">
                <span className="bullet">&#9700;&nbsp;</span>
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
                render={() => <MyProjects githubUser='guillaumeaubert' dockerhubUser='aubertg'/>}
              />
              <Route
                path="/git-contributions-statistics"
                component={GitStats}
              />
              <Route
                path="/vertical-text-generator"
                render={() => <VerticalTextGenerator text="DEVASTATING" transformation="square"/>}
              />
            </div>
          </section>
        </div>
      </div>
    </HashRouter>
  );
};

export default Main;
