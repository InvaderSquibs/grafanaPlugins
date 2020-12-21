import React, { useRef } from 'react';
import { PanelProps } from '@grafana/data';
import { SimpleOptions } from 'types';
import Sankey from './Sankey';

interface Props extends PanelProps<SimpleOptions> {}

export const SimplePanel: React.FC<Props> = ({ options, data, width, height }) => {
  const series = data?.series;
  const svgData = getData(series.splice(0, 1));
  const svgRef = useRef<SVGSVGElement>(null);
  if (!svgData) {
    console.log(svgData);
  }

  const tempData = {
    nodes: [
      { name: 'arrange' },
      { name: 'beta' },
      { name: 'caratine' },
      { name: 'down' },
      { name: 'every' },
      { name: 'file' },
    ],
    links: [
      { source: 0, target: 1, value: 8 },
      { source: 0, target: 2, value: 15 },
      { source: 0, target: 3, value: 6 },
      { source: 0, target: 4, value: 5 },
      { source: 0, target: 5, value: 20 },
      { source: 1, target: 2, value: 2 },
      { source: 1, target: 5, value: 4 },
      { source: 2, target: 4, value: 4 },
      { source: 2, target: 3, value: 7 },
      { source: 2, target: 5, value: 2 },
      { source: 3, target: 5, value: 1 },
    ],
  };
  return (
    <svg width="100%" height="600" ref={svgRef}>
      {svgData && <Sankey data={tempData} width={width} height={height} />}
    </svg>
  );
};

const getData = (series: any) => {
  const eventList: any[] = [];
  const userVisited: any = {};
  const nodes: any = { start: { name: 'start' } };
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
      const userId = userIdList[i];
      const userVisitedCount = userVisited[`${userId}${eventName}`] || 0;
      let currentEventName = eventName;

      if (userVisitedCount > 0) {
        currentEventName += ` ${userVisitedCount}`;
      }

      if (!nodes[currentEventName]) {
        nodes[currentEventName] = { name: currentEventName };
      }

      userVisited[`${userId}${eventName}`] = userVisitedCount + 1;
      eventList.push({ currentEventName, userId, time: timeList[i] });
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
    target = event.currentEventName;
    nodeName = `${source},${target}`;
    if (!links[nodeName]) {
      links[nodeName] = { source, target, value: 0 };
    }
    links[nodeName].value = links[nodeName].value + 1;
    lastUserEvent[event.userId] = target;
  });

  return { nodes: Object.values(nodes), links: Object.values(links) };
};
