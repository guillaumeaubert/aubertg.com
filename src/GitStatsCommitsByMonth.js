import React from 'react';
import * as d3 from 'd3';

const margin = {
  top: 10,
  right: 20,
  bottom: 40,
  left: 40,
};

class GitStatsCommitsByMonth extends React.Component {
  componentDidMount() {
    this.drawChart();
  }

  shouldComponentUpdate() {
    return false;
  }

  drawChart() {
    let data = this.props.data;
    let width = this.props.width - margin.left - margin.right;
    let height = this.props.height - margin.top - margin.bottom;

    let svg = d3.select(this.svg).append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    let x = d3.scaleBand()
      .rangeRound([0, width])
      .padding(0.1)
      .domain(data.map(function(d) { return d.month; }));

    let x_axis = d3.axisBottom()
      .scale(x)
      .tickFormat(function(d) {
        return /^Jan-/.test(d)
          ? d.replace('Jan-','')
          : '';
      });

    svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + height + ')')
      .call(x_axis)
      .selectAll('text')
      .attr('y', 12)
      .attr('x', 5)
      .attr('dy', '.35em')
      .attr('transform', 'rotate(45)')
      .style('text-anchor', 'start');

    let y = d3.scaleLinear()
      .range([height, 0])
      .domain([0, Math.round((d3.max(data, function(d) { return +d.commits; })+1)/50)*50]);

    let y_axis = d3.axisLeft()
      .scale(y)
      .ticks(5, 's');

    svg.append('g')
      .attr('class', 'y axis')
      .call(y_axis);

    svg.selectAll('.bar')
      .data(data)
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', function(d) { return x(d.month); })
      .attr('width', x.bandwidth())
      .attr('y', function(d) { return y(d.commits); })
      .attr('height', function(d) { return height - y(d.commits); })
      .append('title')
      .text(function(d) { return d.month.replace('-', ' ') + ': ' + d.commits + ' commit' + (d.commits === 1 ? '' : 's'); });
  }

  render() {
    let data = this.props.data;
    let total_commits = d3.sum(data, function(d) { return +d.commits; });

    return (
      <div>
        <h3>
          <a id="CommitsByMonth" className="anchor" href="#CommitsByMonth">
            Commits by Month
          </a>
          <span className="count" id="commits_total">
            ({d3.format(',d')(total_commits)} commits)
          </span>
        </h3>
        <div id="commits_by_month">
          <svg
            width={this.props.width}
            height={this.props.height}
            ref={(elem) => { this.svg = elem; }}
          ></svg>
        </div>
      </div>
    );
  }
}

export default GitStatsCommitsByMonth;
