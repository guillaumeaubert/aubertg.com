import React from 'react';
import './css/gitstats.css';
import GitStatsCommitsByMonth from './GitStatsCommitsByMonth';
import GitStatsCommitsByDay from './GitStatsCommitsByDay';
import GitStatsCommitsByWeekdayHour from './GitStatsCommitsByWeekdayHour';
import GitStatsCommitsByLanguage from './GitStatsCommitsByLanguage';
import GitStatsLinesChangedByMonth from './GitStatsLinesChangedByMonth';
import * as d3 from 'd3';

class GitStats extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: null,
    };
  }

  componentDidMount() {
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
    ).then((data) => {
      this.setState({data: data});
    });
  }

  render() {
    let content = '';
    if (this.state.data == null) {
      content = 'Loading...';
    } else {
      let {
        analysis_metadata,
        commits_by_month,
        commits_by_day,
        commit_by_weekday_hour,
        lines_by_language,
        lines_by_month,
      } = this.state.data;
      let formatTime = d3.timeFormat('%x %X');
      let startedAt = new Date(analysis_metadata.started_at * 1000);

      content = (
        <div>
          <div id="metadata">
            (generated at {formatTime(startedAt)} by
            analyzing {analysis_metadata.repositories_analyzed} repositories
            in {Math.ceil(analysis_metadata.ms_spent / 1000)} seconds)
          </div>
          <div id="overview">
            <h4>Jump to:</h4>
            <ul>
              <li>
                <a href="#CommitsByMonth">Commits by month</a>
              </li>
              <li>
                <a href="#CommitsByDay">Commits by day</a>
              </li>
              <li>
                <a href="#CommitsByWeekdayHour">Commits by weekday hour</a>
              </li>
              <li>
                <a href="#CommitsByLanguage">Commits by language / type</a>
              </li>
              <li>
                <a href="#LinesChangedByMonth">Lines changed by month</a>
              </li>
            </ul>

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

          <GitStatsCommitsByMonth data={commits_by_month} width="960" height="300"/>
          <GitStatsCommitsByDay data={commits_by_day} width="960" yearHeight="136" cellSize="17"/>
          <GitStatsCommitsByWeekdayHour data={commit_by_weekday_hour} width="960" height="350"/>
          <GitStatsCommitsByLanguage data={lines_by_language} width="960" height="500"/>
          <GitStatsLinesChangedByMonth data={lines_by_month} width="960" height="400"/>
        </div>
      );
    }

    return (
      <section>
        <h1>Interesting statistics about my open source git commits</h1>
        {content}
      </section>
    );
  }
}

export default GitStats;
