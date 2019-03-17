// @flow strict

import type { Node } from 'react';

import React, { useState, useEffect } from 'react';
import CommitsByMonth from './GitStats/CommitsByMonth';
import CommitsByDay from './GitStats/CommitsByDay';
import CommitsByWeekdayHour from './GitStats/CommitsByWeekdayHour';
import CommitsByLanguage from './GitStats/CommitsByLanguage';
import LinesChangedByMonth from './GitStats/LinesChangedByMonth';
import * as d3 from 'd3';
import './GitStats.css';
import loader from './images/loading-bar.gif';

const GitStats = (): Node => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    document.title = 'Git Contribution Statistics';

    // Retrieve git contribution information.
    fetch(
      '/data/git_contributions.json',
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
    ).then((responseData) => {
      setData(responseData);
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
    let {
      analysis_metadata,
      commits_by_month,
      commits_by_day,
      commit_by_weekday_hour,
      lines_by_language,
      lines_by_month,
    } = data || {};
    let formatTime = d3.timeFormat('%x %X');
    let startedAt = new Date(analysis_metadata.started_at * 1000);

    content = (
      <div id="git-stats">
        <div id="metadata">
          (generated at {formatTime(startedAt)} by
          analyzing {analysis_metadata.repositories_analyzed} repositories
          in {Math.ceil(analysis_metadata.ms_spent / 1000)} seconds)
        </div>
        <div id="overview">
          <h4>Notes:</h4>
          <ul>
            <li>Hover above interesting data points for more information.</li>
            <li>
              The repositories analyzed are downloaded using my
              {' '}
              <a href="https://github.com/guillaumeaubert/go-git-backup">Go git backup tool</a>.
            </li>
            <li>
              The statistics on these repositories are generated by my
              {' '}
              <a href="https://github.com/guillaumeaubert/ruby-git-commits-analyzer">git commits analyzer gem</a>.
            </li>
          </ul>
        </div>

        <CommitsByMonth data={commits_by_month} width={960} height={300}/>
        <CommitsByDay data={commits_by_day} width={960} yearHeight={136} cellSize={17}/>
        <CommitsByWeekdayHour data={commit_by_weekday_hour} width={960} height={350}/>
        <CommitsByLanguage data={lines_by_language} width={960} height={500}/>
        <LinesChangedByMonth data={lines_by_month} width={960} height={400}/>
      </div>
    );
  }

  return (
    <section>
      <h1>Interesting statistics about my open source git commits</h1>
      {content}
    </section>
  );
};

export default GitStats;
