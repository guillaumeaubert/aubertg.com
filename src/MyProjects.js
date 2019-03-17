// @flow strict

import type { Node } from 'react';

import React, { useState, useEffect } from 'react';
import Project from './MyProjects/Project';
import TimeAgo from 'react-timeago';
import inArray from 'in-array';
import './MyProjects.css';
import loader from './images/loading-bar.gif';

const GITHUB_API = 'https://api.github.com/users/';

type TProjectStatus = {|
  +sortOrder: number,
  +isDeprecated: boolean,
  +display: string | Array<string | Node>,
|};

const getProjectStatus = (project): TProjectStatus => {
  if (inArray(project.topics, 'deprecated')) {
    return {
      sortOrder: -1,
      isDeprecated: true,
      display: 'Deprecated'
    };
  } else if (inArray(project.topics, 'maintenance-mode')) {
    return {
      sortOrder: 0,
      isDeprecated: false,
      display: 'Maintenance only'
    };
  } else {
    return {
      sortOrder: Date.parse(project.pushed_at),
      isDeprecated: false,
      display: [
        'Active (',
        React.createElement(
          TimeAgo,
          {
            date: project.pushed_at,
            key: 'active_' + project.id
          }
        ),
        ')'
      ]
    };
  }
};

const MyProjects = (
  {
    githubUser,
    dockerhubUser
  }: {|
    +githubUser: string,
    +dockerhubUser: string,
  |}
): Node => {
  const [projects, setProjects] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'My Projects';

    // Retrieve the list of projects from GitHub.
    fetch(
      GITHUB_API + githubUser + '/repos?page=1&per_page=1000&sort=pushed',
      {
        method: 'GET',
        credentials: 'same-origin',
        headers:
        {
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.github.mercy-preview+json',
        },
      }
    ).then((response) => response.json()
    ).then((responseProjects) => {
      let sortedProjects = responseProjects
        .filter((project) => {
          if (project === null) return false;
          if (project.fork) return false;
          if (project.name.slice(-9) === '_archives') return false;
          return true;
        })
        // Add sort order in O(n).
        .map((project) => {
          var t = getProjectStatus(project);
          project.sortOrder = t.sortOrder;
          project.isDeprecated = t.isDeprecated;
          project.projectStatus = t.display;
          return project;
        })
        // Sort the array of projects.
        .sort(function(a, b) {
          var x = a.sortOrder;
          var y = b.sortOrder;
          return ((x < y) ? 1 : ((x > y) ? -1 : 0));
        });

      setProjects(sortedProjects);
      setLoading(false);
    });
  });

  let content = '';
  if (loading) {
    content = (
      <img
        src={loader}
        alt='Loading...'
        style={{display: 'block', margin: '10px auto'}}
      />
    );
  } else {
    let projectNodes = (projects || [])
      .map((project) =>
        <Project
          key={`project_${project.id}`}
          data={project}
          githubUser={githubUser}
          dockerhubUser={dockerhubUser}
        />
      );
    content = (
      <table className="list" id="github-projects">
        <thead>
          <tr>
            <th className="name">Name</th>
            <th className="links">Links</th>
            <th className="status">Status</th>
            <th className="badges">Badges</th>
          </tr>
        </thead>
        <tbody>
          {projectNodes}
        </tbody>
      </table>
    );
  }

  return (
    <section>
      <h1>A visual dashboard for my open source projects</h1>
      {content}
    </section>
  );
};

export default MyProjects;
