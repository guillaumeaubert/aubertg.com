// @flow strict

import React from 'react';
import Project from './MyProjects/Project';
import TimeAgo from 'react-timeago';
import inArray from 'in-array';
import './MyProjects.css';
import loader from './images/loading-bar.gif';

const GITHUB_API = 'https://api.github.com/users/';

function getProjectStatus(project) {
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
}

type Props = {|
  +githubUser: string,
  +dockerhubUser: string,
|};

type State = {
  projects: ?Array<Object>,
  loading: boolean,
};

class MyProjects extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      projects: null,
      loading: true,
    };
  }

  componentDidMount() {
    document.title = 'My Projects';

    // Retrieve the list of projects from GitHub.
    fetch(
      GITHUB_API + this.props.githubUser + '/repos?page=1&per_page=1000&sort=pushed',
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
    ).then((projects) => {
      let sortedProjects = projects
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

      this.setState({
        projects: sortedProjects,
        loading: false,
      });
    });
  }

  render() {
    let content = '';
    if (this.state.loading) {
      content = (
        <img
          src={loader}
          alt='Loading...'
          style={{display: 'block', margin: '10px auto'}}
        />
      );
    } else {
      let projects = (this.state.projects || [])
        .map((project) =>
          <Project
            key={`project_${project.id}`}
            data={project}
            githubUser={this.props.githubUser}
            dockerhubUser={this.props.dockerhubUser}
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
            {projects}
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
  }
}

export default MyProjects;
