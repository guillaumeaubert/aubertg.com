import React from 'react';
import TimeAgo from 'react-timeago';
import inArray from 'in-array';
import intersect from 'array-intersection';
import './css/projects.css';

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

function getProjectBadges(project, ghUser, dhUser) {
  var badges = [];

  var travis_tags = ['travis-ci', 'cpan', 'golang', 'jquery-plugin', 'ansible-plugin', 'ruby-gem'];
  if (intersect(travis_tags, project.topics).length > 0) {
    badges.push(
      {
        'link': 'https://travis-ci.org/'+ghUser+'/'+project.name,
        'image': 'https://travis-ci.org/'+ghUser+'/'+project.name+'.svg?branch='+project.default_branch,
        'title': 'Build Status'
      }
    );
  }

  var coveralls_tags = ['coveralls', 'cpan', 'jquery-plugin'];
  if (intersect(coveralls_tags, project.topics).length > 0) {
    badges.push(
      {
        'link': 'https://coveralls.io/r/'+ghUser+'/'+project.name+'?branch='+project.default_branch,
        'image': 'https://coveralls.io/repos/'+ghUser+'/'+project.name+'/badge.svg?branch='+project.default_branch,
        'title': 'Coverage Status'
      }
    );
  }

  if (inArray(project.topics, 'docker-hub')) {
    badges.push(
      {
        'link': 'https://hub.docker.com/r/'+dhUser+'/'+project.name+'/builds/',
        'image': 'https://img.shields.io/docker/build/'+dhUser+'/'+project.name+'.svg',
        'title': 'Docker Build Status'
      }
    );
  }

  if (inArray(project.topics, 'golang')) {
    badges.push(
      {
        'link': 'https://goreportcard.com/projectrt/github.com/'+ghUser+'/'+project.name,
        'image': 'https://goreportcard.com/badge/github.com/'+ghUser+'/'+project.name,
        'title': 'Go Report Card'
      }
    );
  }

  if (inArray(project.topics, 'ruby-gem')) {
    badges.push(
      {
        'link': 'https://inch-ci.org/github/'+ghUser+'/'+project.name,
        'image': 'https://inch-ci.org/github/'+ghUser+'/'+project.name+'.svg?branch=master&style=shields',
        'title': 'Inline Docs'
      }
    );
  }

  return badges;
}

function getIconClass(project) {
  var topics = [
    'ansible-plugin',
    'bash',
    'cpan',
    'docker-image',
    'golang',
    'jquery-plugin',
    'ruby-gem'
  ];
  var relevant_topics = intersect(topics, project.topics);
  if (relevant_topics.length > 0) {
    return relevant_topics[0] + '-icon';
  }
}

function getProjectWebsite(url) {
  if (!url) return null;

  var matches = url.match(/^https?:\/\/([^/?#]+)/i);
  if (!matches) return null;

  var title = function () {
    switch (matches[1]) {
      case 'metacpan.org':
        return 'MetaCPAN';
      case 'hub.docker.com':
        return 'Docker Hub';
      case 'plugins.jquery.com':
        return 'JQuery Plugins';
      case 'rubygems.org':
        return 'RubyGems';
      case 'godoc.org':
        return 'GoDoc';
      default:
        return 'Website';
    }
  };

  return (
    <a href={url}>{title()}</a>
  );
}

class Projects extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      projects: null,
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
      // Add sort order in O(n).
      projects = projects.map((project) => {
        var t = getProjectStatus(project);
        project.sortOrder = t.sortOrder;
        project.isDeprecated = t.isDeprecated;
        project.projectStatus = t.display;
        return project;
      });

      // Sort the array of projects.
      projects = projects.sort(function(a, b) {
        var x = a.sortOrder;
        var y = b.sortOrder;
        return ((x < y) ? 1 : ((x > y) ? -1 : 0));
      });

      this.setState({ projects: projects });
    });
  }

  render() {
    let content = '';
    if (this.state.projects === null) {
      content = (
        <tr>
          <td colSpan="4" className="loading">
            Loading ...
          </td>
        </tr>
      );
    } else {
      // Display projects in the table.
      content = this.state.projects
        .filter((project) => {
          if (project === null) return false;
          if (project.fork) return false;
          if (project.name.slice(-9) === '_archives') return false;
          return true;
        })
        .map((project) => {
          let website = getProjectWebsite(project.homepage);
          let badges = project.isDeprecated
            ? []
            : getProjectBadges(project, this.props.githubUser, this.props.dockerhubUser);

          //console.log(project);
          let row = (
            <tr key={`project_${project.id}`}>
              {/* Project name and description */}
              <td
                className={`name ${getIconClass(project)}`}
                title={project.description}
              >
                { project.name }
              </td>
              {/* Links */}
              <td className="links">
                <a href={project.html_url}>
                  GitHub
                </a>
                {website ? ', ' : ''}
                {website}
              </td>
              {/* Status */}
              <td className="status" title={`Last commit: ${new Date(project.pushed_at)}`}>
                {project.projectStatus}
              </td>
              {/* Badges */}
              <td className="badges">
                {badges.map((badge) => {
                  return (
                    <a href={badge.link} key={badge.link}>
                      <img src={badge.image} title={badge.title} alt={badge.title}/>
                    </a>
                  );
                })}
              </td>
            </tr>
          );
          return row;
        });
    }

    return (
      <section>
        <h1>A visual dashboard for my open source projects</h1>
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
            {content}
          </tbody>
        </table>
      </section>
    );
  }
}

export default Projects;
