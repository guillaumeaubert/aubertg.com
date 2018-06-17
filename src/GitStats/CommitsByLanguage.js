// @flow strict

import React from 'react';
import * as d3 from 'd3';
import './CommitsByLanguage.css';

const margin =
{
  left: 60,
  right: 30,
  top: 30,
  bottom: 35,
};

type Props = {
  data: any,
  width: number,
  height: number,
};

class CommitsByLanguage extends React.Component<Props> {
  svg: any;
  data: ?any;
  languageCounter: number;

  constructor(props: Props) {
    super(props);

    this.data = d3
      .entries(this.props.data)
      .filter(
        function(d) {
          return !d.key.match(/^Text$/);
        }
      )
      .map(
        function(d, i) {
          d.lines_added = d.value.added;
          d.lines_deleted = d.value.deleted;
          d.commits = d.value.commits;
          d.language = d.key;
          d.counter = i;
          delete d.value;
          delete d.key;
          return d;
        }
      );

    this.languageCounter = this.data.length;
  }

  componentDidMount() {
    this.drawChart();
  }

  shouldComponentUpdate() {
    return false;
  }

  drawChart() {
    let data = this.data;
    let width = this.props.width;
    let height = this.props.height;
    let svg = d3.select(this.svg).append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // Color scale.
    let colors = d3.scaleOrdinal(d3.schemePaired);

    // X-axis scale.
    let x = d3.scaleLog()
      .domain([1, d3.max(data, function (d) { return d.lines_added; })])
      .clamp(true)
      .range([0, width - margin.left - margin.right]);

    // Y-axis scale.
    let y = d3.scaleLog()
      .domain([1, d3.max(data, function (d) { return d.lines_deleted; })])
      .clamp(true)
      .range([height - margin.top - margin.bottom, 0]);

    // Circle radius scale.
    let r = d3.scaleLog()
      .domain(d3.extent(data, function(d) { return d.commits; }))
      .range([5,25]);

    // X-axis label.
    svg.append('text')
      .attr('text-anchor', 'end')
      .attr('x', width / 2)
      .attr('y', height - 30)
      .text('Lines added');

    // Y-axis label.
    svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')
      .attr('x', -(height-60)/2)
      .attr('y', -40)
      .text('Lines deleted');

    // Define X and Y axis.
    let xAxis = d3.axisBottom()
      .scale(x)
      .tickPadding(2)
      .tickFormat(
        function (d) {
          return x.tickFormat(10,d3.format('.1s'))(d);
        }
      );
    let yAxis = d3.axisLeft()
      .scale(y)
      .tickPadding(2)
      .tickFormat(
        function (d) {
          return y.tickFormat(10,d3.format('.1s'))(d);
        }
      );

    // Add axis to the graph.
    svg.append('g')
      .attr('class', 'y axis')
      .call(yAxis);
    svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + y.range()[0] + ')')
      .call(xAxis);

    // Function to format numbers with a separator for thousands.
    let format_thousands = d3.format(',d');

    // Add points.
    let points = svg.selectAll('g.node')
      .data(
        data,
        function (d) { return d.language; }
      );
    let pointsGroup = points.enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', function (d) { return 'translate(' + x(d.lines_added) + ',' + y(d.lines_deleted) + ')'; });
    pointsGroup
      .append('circle')
      .attr('r', function(d){ return r(d.commits); })
      .attr('class', 'dot')
      .style('fill', function (d) { return colors(d.counter); });
    pointsGroup
      .append('text')
      .style('text-anchor', 'middle')
      .attr('dy', -10)
      .text(function (d) { return d.language; });
    pointsGroup
      .append('title')
      .text(
        function(d) {
          return d.language + ': +' + format_thousands(d.lines_added) + ' -'
            + format_thousands(d.lines_deleted) + ' lines and '
            + format_thousands(d.commits) + ' commit(s)';
        }
      );
  }

  render() {
    return (
      <div>
        <h3>
          Commits by Language / Type
          <span className="count">
            ({this.languageCounter} found)
          </span>
        </h3>
        <ul>
          <li>X-axis: lines added.</li>
          <li>Y-axis: lines deleted.</li>
          <li>Circle radius: logarithmic scale based on the number of commits in that language.</li>
        </ul>
        <div id="commits-by-language">
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

export default CommitsByLanguage;
