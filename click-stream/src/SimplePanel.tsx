import React from 'react';
import * as d3 from 'd3';
import { sankey as d3sankey } from 'd3-sankey';
import { PanelProps } from '@grafana/data';
import { SimpleOptions } from 'types';

interface Props extends PanelProps<SimpleOptions> {}

export const SimplePanel: React.FC<Props> = ({ options, data, width, height }) => {
  const series = data?.series;
  const { nodes, links } = getData(series);

  const margin = { top: 10, right: 10, bottom: 10, left: 10 };

  const svg = d3.select('#sankey-graph').attr('viewBox', [0, 0, width, height].join(' ');
  //d3.create('svg').attr('viewBox', [0, 0, width, height].join(' '));

  // Color scale used
  const color = d3.scaleOrdinal(d3.schemeCategory10);

  // Set the sankey diagram properties
  const sankey = d3sankey()
    .nodeWidth(36)
    .nodePadding(290)
    .size([width, height]);

  // Constructs a new Sankey generator with the default settings.
  sankey.nodes(nodes).links(links);

  // add in the links
  svg
    .append('g')
    .selectAll('.link')
    .data(links)
    .enter()
    .append('path')
    .attr('class', 'link')
    //.attr('d', sankey.link())
    .style('stroke-width', function(d: any) {
      return Math.max(1, d.dy);
    })
    .sort(function(a: any, b: any) {
      return b.dy - a.dy;
    });

  // add in the nodes
  const node = svg
    .append('g')
    .selectAll('.node')
    .data(nodes)
    .enter()
    .append('g')
    .attr('class', 'node')
    .attr('transform', function(d: any) {
      return 'translate(' + d.x + ',' + d.y + ')';
    });

  // add the rectangles for the nodes
  node
    .append('rect')
    .attr('height', function(d: any) {
      return d.dy;
    })
    .attr('width', sankey.nodeWidth())
    .style('fill', function(d: any) {
      return (d.color = color(d.name.replace(/ .*/, '')) || '');
    })
    .style('stroke', 'rgb(200,200,200)')
    // function(d: any) {
    //   return d3.rgb(d.color).darker(2) || '';
    // })
    // Add hover text
    .append('title')
    .text(function(d: any) {
      return d.name + '\n' + 'There is ' + d.value + ' stuff in this node';
    });

  // add in the title for the nodes
  node
    .append('text')
    .attr('x', -6)
    .attr('y', function(d: any) {
      return d.dy / 2;
    })
    .attr('dy', '.35em')
    .attr('text-anchor', 'end')
    .attr('transform', null)
    .text(function(d: any) {
      return d.name;
    })
    .filter(function(d: any) {
      return d.x < width / 2;
    })
    .attr('x', 6 + sankey.nodeWidth())
    .attr('text-anchor', 'start');

  //return svg.node();
  return (
    <svg id='sankey-graph' />
  )
};

const getData = (series: any) => {
  const eventList: any[] = [];
  const nodes: any = { start: { id: 'start', name: 'start' } };
  let eventName, timeField, timeList, userIdField, userIdList;

  series.forEach((event: any) => {
    eventName = event?.name;
    if (!eventName) {
      return;
    }

    timeField = event?.fields[0];
    timeList = timeField?.values?.toArray();
    userIdField = event?.fields[1];
    userIdList = userIdField?.values?.toArray();

    for (let i = 0; i < timeList.length; i++) {
      if (!nodes[eventName]) {
        nodes[eventName] = { id: eventName, name: eventName.substring(7) };
      }
      eventList.push({ eventName, userId: userIdList[i], time: timeList[i] });
    }
  });

  eventList.sort((eventA: any, eventB: any) => {
    return eventA.time - eventB.time;
  });

  const lastUserEvent: any[] = [];
  const links: any = {};
  let nodeName, source, target;
  eventList.forEach(event => {
    source = lastUserEvent[event.userId] || 'start';
    target = event.eventName;
    nodeName = `${source},${target}`;
    if (!links[nodeName]) {
      links[nodeName] = { source, target, value: 0 };
    }
    links[nodeName].value = links[nodeName].value + 1;
    lastUserEvent[event.userId] = target;
  });

  return { nodes, links };
};
