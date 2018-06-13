import React from 'react';
import * as d3 from 'd3';

const margin = {
  top: 20,
  right: 0,
  bottom: 40,
  left: 40,
};
const buckets = 9;
const colors = ['#d6e685', '#b7d174', '#98bc64', '#7aa754', '#5b9243', '#3c7d33', '#1e6823'];
const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const times = [
  '12am', '1am', '2am', '3am', '4am', '5am', '6am', '7am', '8am', '9am', '10am', '11am',
  '12pm', '1pm', '2pm', '3pm', '4pm', '5pm', '6pm', '7pm', '8pm', '9pm', '10pm', '11pm'
];

class GitStatsCommitsByWeekdayHour extends React.Component {
  constructor(props) {
    super(props);

    let data = this.props.data;
    let formatted_data = [];
    let most_active_weekday_hour;
    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        let value = +data[days[day]][hour];
        let node =
          {
            'day': day,
            'hour': hour,
            'value': value,
          };
        if (!most_active_weekday_hour || value > most_active_weekday_hour.value) {
          most_active_weekday_hour = node;
        }
        formatted_data.push(node);
      }
    }
    this.formatted_data = formatted_data;
    this.most_active_weekday_hour = most_active_weekday_hour;
  }

  componentDidMount() {
    this.drawChart();
  }

  shouldComponentUpdate() {
    return false;
  }

  drawChart() {
    let width = this.props.width - margin.left - margin.right;
    let height = this.props.height - margin.top - margin.bottom;
    let formatted_data = this.formatted_data;
    let grid_size = Math.floor(width / 24);
    let legend_element_width = grid_size * 2;

    // Prepare the graph space and its axes.
    let svg = d3.select(this.svg).append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // Labels for days.
    svg.selectAll('.dayLabel')
      .data(days)
      .enter().append('text')
      .text(function (d) { return d; })
      .attr('x', 0)
      .attr('y', function (d, i) { return i * grid_size; })
      .style('text-anchor', 'end')
      .attr('transform', 'translate(-6,' + grid_size / 1.5 + ')')
      .attr('class', function (d, i) { return ((i >= 0 && i <= 4) ? 'dayLabel mono axis axis-workweek' : 'dayLabel mono axis'); });

    // Labels for hours.
    svg.selectAll('.timeLabel')
      .data(times)
      .enter().append('text')
      .text(function(d) { return d; })
      .attr('x', function(d, i) { return i * grid_size; })
      .attr('y', 0)
      .style('text-anchor', 'middle')
      .attr('transform', 'translate(' + grid_size / 2 + ', -6)')
      .attr('class', function(d, i) { return ((i >= 8 && i <= 18) ? 'timeLabel mono axis axis-worktime' : 'timeLabel mono axis'); });

    // Create a color scale based on the data.
    let color_scale = d3.scaleQuantile()
      .domain([1, buckets - 1, d3.max(formatted_data, function (d) { return d.value; })])
      .range(colors);

    // Add tiles to represent the data.
    let cards = svg.selectAll('.hour')
      .data(formatted_data);

    cards.enter().append('rect')
      .attr('x', function(d) { return d.hour * grid_size; })
      .attr('y', function(d) { return d.day * grid_size; })
      .attr('rx', 4)
      .attr('ry', 4)
      .attr('class', 'hour bordered')
      .attr('width', grid_size)
      .attr('height', grid_size)
      .style('fill', function(d) { return d.value === 0 ? '#fff' : color_scale(d.value); })
      .append('title')
      .text(function(d) { return d.value + (d.value === 1 ? ' commit' : ' commits'); });

    cards.exit().remove();

    // Add the legend below the graph.
    let legend = svg.selectAll('.legend')
      .data([1].concat(color_scale.quantiles()), function(d) { return d; })
      .enter();

    legend.append('g')
      .attr('class', 'legend');

    legend.append('rect')
      .attr('x', function(d, i) { return legend_element_width * i; })
      .attr('y', height)
      .attr('width', legend_element_width)
      .attr('height', grid_size / 2)
      .style('fill', function(d, i) { return colors[i]; });

    legend.append('text')
      .attr('class', 'mono')
      .text(function(d) { return '≥ ' + Math.round(d); })
      .attr('x', function(d, i) { return legend_element_width * i; })
      .attr('y', height + grid_size);

    legend.exit().remove();
  }

  render() {
    return (
      <div id="commits_by_weekday_hour">
        <h3>
          <a id="CommitsByWeekdayHour" className="anchor" href="#CommitsByWeekdayHour">
            Commits by Weekday Hour
          </a>
          <span className="count" id="most_active_weekday_hour">
            (most active: {days[this.most_active_weekday_hour.day]} {times[this.most_active_weekday_hour.hour]})
          </span>
        </h3>
        <svg
          width={this.props.width}
          height={this.props.height}
          ref={(elem) => { this.svg = elem; }}
        ></svg>
      </div>
    );
  }
}

export default GitStatsCommitsByWeekdayHour;
