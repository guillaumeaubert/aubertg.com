import React from "react";
import * as d3 from "d3";

const margin = {
  top: 10,
  right: 20,
  bottom: 10,
  left: 60,
};
const center_space = 40;

class GitStatsLinesChangedByMonth extends React.Component {
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



    let svg = d3.select(this.svg).append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var format_lines_count = d3.format(",d");

    // Set up mirrored X scales and axis.
    var x = d3.scaleBand()
      .range([0, width])
      .padding(0.1)
      .domain(data.map(function(d) { return d.month; }));

    var x_axis_added = d3.axisBottom()
      .scale(x)
      .tickFormat(function(d) {
        return /^Jan-/.test(d)
          ? d.replace('Jan-','')
          : '';
      })
      .tickValues(x.domain().filter(function(d, i) { return /^Jan-/.test(d); }));

    var x_axis_deleted = d3.axisTop()
      .scale(x)
      .tickFormat(function(d) {
        return /^Jan-/.test(d)
          ? d.replace('Jan-','')
          : '';
      })
      .tickValues(x.domain().filter(function(d, i) { return /^Jan-/.test(d); }));

    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + (height-center_space)/2 + ")")
      .call(x_axis_added)
      .selectAll("text")
        .attr("y", 16)
        .style("text-anchor", "middle");

    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + (height+center_space)/2 + ")")
      .call(x_axis_deleted)
      .selectAll("text")
        .style("display", "none");

    // Determine the max lines added/deleted across the month range.
    // This allows giving each graph (lines added, lines deleted) the same scale.
    var max_changed_lines = Math.max(
      d3.max(data, function(d) { return +d.added; }),
      d3.max(data, function(d) { return +d.deleted; })
    );

    // Set up scale and axis for lines added.
    var y_added = d3.scaleLinear()
      .range([(height-center_space)/2, 0])
      .domain([0, max_changed_lines]);

    var y_axis_added = d3.axisLeft()
      .scale(y_added)
      .ticks(5)
      .tickFormat(d3.format(".1s"));

    svg.append("g")
      .attr("class", "y axis lines_added")
      .call(y_axis_added);

    svg.append("text")
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .attr("x", -(height)/4)
      .attr("y", -40)
      .attr("class", "lines_added")
      .text("Lines added");

    // Set up scale and axis for lines deleted.
    var y_deleted = d3.scaleLinear()
      .range([(height+center_space)/2, height])
      .domain([0, max_changed_lines]);

    var y_axis_deleted = d3.axisLeft()
      .scale(y_deleted)
      .ticks(5)
      .tickFormat(d3.format(".1s"));

    svg.append("g")
      .attr("class", "y axis lines_deleted")
      .call(y_axis_deleted);

    svg.append("text")
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .attr("x", -(height)/4*3)
      .attr("y", -40)
      .attr("class", "lines_deleted")
      .text("Lines deleted");

    // Display bars.
    svg.selectAll(".bar_added")
      .data(data)
      .enter().append("rect")
      .attr("class", "bar_added lines_added")
      .attr("x", function(d) { return x(d.month); })
      .attr("width", x.bandwidth())
      .attr("y", function(d) { return y_added(d.added); })
      .attr("height", function(d) { return (height-center_space)/2 - y_added(d.added); })
      .append("title")
        .text(function(d) { return d.month.replace('-', ' ') + ': ' + format_lines_count(d.added) + ' line' + (d.added === 1 ? '' : 's'); });

    svg.selectAll(".bar_deleted")
      .data(data)
      .enter().append("rect")
      .attr("class", "bar_deleted lines_deleted")
      .attr("x", function(d) { return x(d.month); })
      .attr("width", x.bandwidth())
      .attr("height", function(d) { return y_deleted(d.deleted)-(height+center_space)/2; })
      .attr("y", function(d) { return (height+center_space)/2+1; })
      .append("title")
        .text(function(d) { return d.month.replace('-', ' ') + ': ' + format_lines_count(d.deleted) + ' line' + (d.deleted === 1 ? '' : 's'); });
  }

  render() {
    let data = this.props.data;
    let format_lines_count = d3.format(",d");
    let total_lines_added = d3.sum(data, function(d) { return +d.added; });
    let total_lines_deleted = d3.sum(data, function(d) { return +d.deleted; });

    return (
      <div>
        <h3>
          <a id="LinesChangedByMonth" className="anchor" href="#LinesChangedByMonth">
            Lines Changed by Month
          </a>
          <span className="count" id="total_lines_changed">
            (total: +{format_lines_count(total_lines_added)}{' '}
            -{format_lines_count(total_lines_deleted)})
          </span>
        </h3>
        <div id="lines_changed_by_month">
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

export default GitStatsLinesChangedByMonth;

