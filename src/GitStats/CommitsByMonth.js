// @flow strict

import type { Node } from 'react';

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import './CommitsByMonth.css';

const margin = {
  top: 10,
  right: 20,
  bottom: 40,
  left: 40,
};

type Props = {|
  +data: any,
  +width: number,
  +height: number,
|};

const CommitsByMonth = (
  {
    data,
    width,
    height,
  }: Props
): Node => {
  const refContainer = useRef(null);

  useEffect(() => {
    const actualWidth = width - margin.left - margin.right;
    const actualHeight = height - margin.top - margin.bottom;

    let svg = d3.select(refContainer.current).append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    let x = d3.scaleBand()
      .rangeRound([0, actualWidth])
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
      .attr('transform', 'translate(0,' + actualHeight + ')')
      .call(x_axis)
      .selectAll('text')
      .attr('y', 12)
      .attr('x', 5)
      .attr('dy', '.35em')
      .attr('transform', 'rotate(45)')
      .style('text-anchor', 'start');

    let y = d3.scaleLinear()
      .range([actualHeight, 0])
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
      .attr('height', function(d) { return actualHeight - y(d.commits); })
      .append('title')
      .text(function(d) { return d.month.replace('-', ' ') + ': ' + d.commits + ' commit' + (d.commits === 1 ? '' : 's'); });
  }, []); // eslint-disable-line

  let total_commits = d3.sum(data, function(d) { return +d.commits; });

  return (
    <div>
      <h3>
        Commits by Month
        <span className="count">
          ({d3.format(',d')(total_commits)} commits)
        </span>
      </h3>
      <div id="commits-by-month">
        <svg
          width={width}
          height={height}
          ref={refContainer}
        ></svg>
      </div>
    </div>
  );
};

export default React.memo<Props>(CommitsByMonth);
