// @flow strict

import type { Node } from 'react';

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import './LinesChangedByMonth.css';

const margin = {
  top: 10,
  right: 20,
  bottom: 10,
  left: 60,
};

const center_space = 40;

type Props = {|
  +data: any,
  +width: number,
  +height: number,
|};

const LinesChangedByMonth = (
  {
    data,
    width,
    height,
  }: Props
): Node => {
  const refContainer = useRef(null);

  useEffect(() => {
    let actualWidth = width - margin.left - margin.right;
    let actualHeight = height - margin.top - margin.bottom;

    let svg = d3.select(refContainer.current).append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    let format_lines_count = d3.format(',d');

    // Set up mirrored X scales and axis.
    let x = d3.scaleBand()
      .range([0, actualWidth])
      .padding(0.1)
      .domain(data.map(function(d) { return d.month; }));

    let x_axis_added = d3.axisBottom()
      .scale(x)
      .tickFormat(function(d) {
        return /^Jan-/.test(d)
          ? d.replace('Jan-','')
          : '';
      })
      .tickValues(x.domain().filter(function(d) { return /^Jan-/.test(d); }));

    let x_axis_deleted = d3.axisTop()
      .scale(x)
      .tickFormat(function(d) {
        return /^Jan-/.test(d)
          ? d.replace('Jan-','')
          : '';
      })
      .tickValues(x.domain().filter(function(d) { return /^Jan-/.test(d); }));

    svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + (actualHeight-center_space)/2 + ')')
      .call(x_axis_added)
      .selectAll('text')
      .attr('y', 16)
      .style('text-anchor', 'middle');

    svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + (actualHeight+center_space)/2 + ')')
      .call(x_axis_deleted)
      .selectAll('text')
      .style('display', 'none');

    // Determine the max lines added/deleted across the month range.
    // This allows giving each graph (lines added, lines deleted) the same scale.
    let max_changed_lines = Math.max(
      d3.max(data, function(d) { return +d.added; }),
      d3.max(data, function(d) { return +d.deleted; })
    );

    // Set up scale and axis for lines added.
    let y_added = d3.scaleLinear()
      .range([(actualHeight-center_space)/2, 0])
      .domain([0, max_changed_lines]);

    let y_axis_added = d3.axisLeft()
      .scale(y_added)
      .ticks(5)
      .tickFormat(d3.format('.1s'));

    svg.append('g')
      .attr('class', 'y axis lines_added')
      .call(y_axis_added);

    svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')
      .attr('x', -(actualHeight)/4)
      .attr('y', -40)
      .attr('class', 'lines_added')
      .text('Lines added');

    // Set up scale and axis for lines deleted.
    let y_deleted = d3.scaleLinear()
      .range([(actualHeight+center_space)/2, actualHeight])
      .domain([0, max_changed_lines]);

    let y_axis_deleted = d3.axisLeft()
      .scale(y_deleted)
      .ticks(5)
      .tickFormat(d3.format('.1s'));

    svg.append('g')
      .attr('class', 'y axis lines_deleted')
      .call(y_axis_deleted);

    svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')
      .attr('x', -(actualHeight)/4*3)
      .attr('y', -40)
      .attr('class', 'lines_deleted')
      .text('Lines deleted');

    // Display bars.
    svg.selectAll('.bar_added')
      .data(data)
      .enter().append('rect')
      .attr('class', 'bar_added lines_added')
      .attr('x', function(d) { return x(d.month); })
      .attr('width', x.bandwidth())
      .attr('y', function(d) { return y_added(d.added); })
      .attr('height', function(d) { return (actualHeight-center_space)/2 - y_added(d.added); })
      .append('title')
      .text(function(d) { return d.month.replace('-', ' ') + ': ' + format_lines_count(d.added) + ' line' + (d.added === 1 ? '' : 's'); });

    svg.selectAll('.bar_deleted')
      .data(data)
      .enter().append('rect')
      .attr('class', 'bar_deleted lines_deleted')
      .attr('x', function(d) { return x(d.month); })
      .attr('width', x.bandwidth())
      .attr('height', function(d) { return y_deleted(d.deleted)-(actualHeight+center_space)/2; })
      .attr('y', function() { return (actualHeight+center_space)/2+1; })
      .append('title')
      .text(function(d) { return d.month.replace('-', ' ') + ': ' + format_lines_count(d.deleted) + ' line' + (d.deleted === 1 ? '' : 's'); });
  }, []);

  const format_lines_count = d3.format(',d');
  const total_lines_added = d3.sum(data, function(d) { return +d.added; });
  const total_lines_deleted = d3.sum(data, function(d) { return +d.deleted; });

  return (
    <div>
      <h3>
        Lines Changed by Month
        <span className="count">
          (total: +{format_lines_count(total_lines_added)}{' '}
          -{format_lines_count(total_lines_deleted)})
        </span>
      </h3>
      <div id="lines-changes-by-month">
        <svg
          width={width}
          height={height}
          ref={refContainer}
        ></svg>
      </div>
    </div>
  );
};

export default React.memo<Props>(LinesChangedByMonth);
