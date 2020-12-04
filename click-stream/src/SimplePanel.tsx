import React from 'react';
import { PanelProps } from '@grafana/data';
import { SimpleOptions } from 'types';

interface Props extends PanelProps<SimpleOptions> {}

export const SimplePanel: React.FC<Props> = ({ options, data, width, height }) => {
  const series = data?.series;
  const displayData = getData(series);

  console.log({ displayData });
  return (
    <svg width={width} height={height}>
      <g>
        <text x="57.452377" y="90.714287" id="text835">
          <tspan id="tspan833" x="57.452377" y="90.714287">
            {data}
          </tspan>
        </text>
      </g>
    </svg>
  );
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

  return Object.values({ nodes, links });
};
