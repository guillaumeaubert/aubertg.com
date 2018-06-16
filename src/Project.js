import React from 'react';
import inArray from 'in-array';
import intersect from 'array-intersection';
import './Project.css';

const TRAVIS_TAGS = ['travis-ci', 'cpan', 'golang', 'jquery-plugin', 'ansible-plugin', 'ruby-gem'];
const COVERALLS_TAGS = ['coveralls', 'cpan', 'jquery-plugin'];
const ICON_TAGS = [
  'ansible-plugin',
  'bash',
  'cpan',
  'docker-image',
  'golang',
  'jquery-plugin',
  'ruby-gem',
];
const WEBSITE_NAMES = {
  'metacpan.org': 'MetaCPAN',
  'hub.docker.com': 'Docker Hub',
  'plugins.jquery.com': 'JQuery Plugins',
  'rubygems.org': 'RubyGems',
  'godoc.org': 'GoDoc',
};

function getProjectBadges(project, ghUser, dhUser) {
  let badges = [];

  if (intersect(TRAVIS_TAGS, project.topics).length > 0) {
    badges.push(
      {
        'link': 'https://travis-ci.org/'+ghUser+'/'+project.name,
        'image': 'https://travis-ci.org/'+ghUser+'/'+project.name+'.svg?branch='+project.default_branch,
        'title': 'Build Status'
      }
    );
  }

  if (intersect(COVERALLS_TAGS, project.topics).length > 0) {
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
  let relevant_topics = intersect(ICON_TAGS, project.topics);
  if (relevant_topics.length > 0) {
    return relevant_topics[0] + '-icon';
  }
}

function getProjectWebsite(url) {
  if (!url) return null;

  let matches = url.match(/^https?:\/\/([^/?#]+)/i);
  if (!matches) return null;

  let title = WEBSITE_NAMES[matches[1]] || 'Website';
  return (
    <a href={url}>{title}</a>
  );
}

class Project extends React.Component {
  render() {
    let project = this.props.data;
    let website = getProjectWebsite(project.homepage);
    let badges = project.isDeprecated
      ? []
      : getProjectBadges(project, this.props.githubUser, this.props.dockerhubUser);

    return (
      <tr>
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
  }
}

export default Project;
