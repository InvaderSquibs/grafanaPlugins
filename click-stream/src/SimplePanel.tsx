import React from 'react';
import { PanelProps } from '@grafana/data';
import { SimpleOptions } from 'types';

interface Props extends PanelProps<SimpleOptions> {}

export const SimplePanel: React.FC<Props> = ({ options, data, width, height }) => {
  const series = data?.series;
  const eventList: any[] = [];
  let eventName, timeField, timeList, userIdField, userIdList;

  series.forEach(event => {
    eventName = event?.name;
    if (!eventName) {
      return;
    }

    timeField = event?.fields[0];
    timeList = timeField?.values?.toArray();
    userIdField = event?.fields[1];
    userIdList = userIdField?.values?.toArray();

    for (let i = 0; i < timeList.length; i++) {
      eventList.push({ eventName, userId: userIdList[i], time: timeList[i] });
    }
  });

  eventList.sort((eventA: any, eventB: any) => {
    return eventA.time - eventB.time;
  });

  const lastUserEvent: any[] = [];
  const eventMap: any = {};
  let mapName;
  eventList.forEach(event => {
    if (lastUserEvent[event.userId]) {
      mapName = `${lastUserEvent[event.userId]},${event.eventName}`;
      eventMap[mapName] = eventMap[mapName] ? eventMap[mapName] + 1 : 1;
    }

    lastUserEvent[event.userId] = event.eventName;
  });

  const flatArr = Object.keys(eventMap).reduce((agg: String[], key) => {
    agg.push(`${key},${eventMap[key]}`);
    return agg;
  }, []);

  console.log({ flatArr });
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
