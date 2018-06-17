// @flow strict

import React from 'react';
import * as d3 from 'd3';
import './CommitsByDay.css';

// Add a timeWeekOfYear function for backward compatibility with d3 v3.
function timeWeekOfYear(date) {
  return +d3.timeFormat('%-U')(date);
}

type Props = {
  data: any,
  width: number,
  yearHeight: number,
  cellSize: number,
};

class CommitsByDay extends React.Component<Props> {
  container: ?HTMLDivElement;

  componentDidMount() {
    this.drawChart();
  }

  shouldComponentUpdate() {
    return false;
  }

  drawChart() {
    let data = this.props.data;
    let width = this.props.width;
    let height = this.props.yearHeight;
    let calendar_cell_size = this.props.cellSize;

    // Function to draw month outlines.
    let calendar_month_path = function(t0)
    {
      let t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0);
      let d0 = t0.getDay();
      let w0 = timeWeekOfYear(t0);
      let d1 = t1.getDay();
      let w1 = timeWeekOfYear(t1);
      return 'M' + (w0 + 1) * calendar_cell_size + ',' + d0 * calendar_cell_size
        + 'H' + w0 * calendar_cell_size + 'V' + 7 * calendar_cell_size
        + 'H' + w1 * calendar_cell_size + 'V' + (d1 + 1) * calendar_cell_size
        + 'H' + (w1 + 1) * calendar_cell_size + 'V' + 0
        + 'H' + (w0 + 1) * calendar_cell_size + 'Z';
    };

    let format = d3.timeFormat('%Y-%m-%d');

    // Create a color scale based on the data.
    let max_commits_in_a_day = d3.max(d3.values(data));
    let color = d3.scaleQuantize()
      .domain([0, Math.log(max_commits_in_a_day+1)])
      .range(d3.range(4).map(function(d) { return 'q' + d + '-11'; }));

    // Determine the years to display.
    let years = d3.keys(data).map(function(d){
      return parseInt(d.split('-')[0], 10);
    });

    // Set up graph.
    let svg = d3.select(this.container)
      .selectAll('svg')
      .data(d3.range(d3.min(years), d3.max(years)+1))
      .enter()
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('class', 'RdYlGn')
      .append('g')
      .attr('transform', 'translate(' + ((width - calendar_cell_size * 53) / 2) + ',' + (height - calendar_cell_size * 7 - 1) + ')');

    svg.append('text')
      .attr('transform', 'translate(-6,' + calendar_cell_size * 3.5 + ')rotate(-90)')
      .style('text-anchor', 'middle')
      .text(function(d) { return d; });

    // Add tiles for the days.
    let rect = svg.selectAll('.day')
      .data(function(d) { return d3.timeDays(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
      .enter().append('rect')
      .attr('class', 'day')
      .attr('width', calendar_cell_size)
      .attr('height', calendar_cell_size)
      .attr('x', function(d) { return timeWeekOfYear(d) * calendar_cell_size; })
      .attr('y', function(d) { return d.getDay() * calendar_cell_size; })
      .datum(format);

    rect.append('title')
      .text(function(d) { return d + ': 0 commits'; });

    // Add month outlines.
    svg.selectAll('.month')
      .data(function(d) { return d3.timeMonths(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
      .enter()
      .append('path')
      .attr('class', 'month')
      .attr('d', calendar_month_path);

    // Colorize tiles based on data.
    rect.filter(function(d) { return d in data; })
      .attr('class', function(d) { return 'day ' + color(Math.log(data[d]+1)); })
      .select('title')
      .text(function(d) { let commits = data[d]; return d + ': ' + commits + ' commit' + (commits === 1 ? '' : 's'); });
  }

  render() {
    let data = this.props.data;
    let total_days = Object.keys(data).length;

    return (
      <div id="commits-by-day" ref={(elem) => { this.container = elem; }}>
        <h3>
          Commits by Day
          <span className="count">
            ({total_days} active days)
          </span>
        </h3>
      </div>
    );
  }
}

export default CommitsByDay;
