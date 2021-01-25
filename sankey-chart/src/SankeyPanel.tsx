import React from 'react';
import { PanelProps } from '@grafana/data';
import { SimpleOptions } from 'types';
import SankeyChart from './SankeyChart';
import * as SankeyData from './SankeyData';

interface Props extends PanelProps<SimpleOptions> {}

export const SankeyPanel: React.FC<Props> = ({ options, data, width, height, replaceVariables }) => {
  const nodeFlowData = JSON.parse(replaceVariables('$nodeFlowData'));
  const flow = nodeFlowData.map((node: any) => node.name);
  const labels: any = {};
  nodeFlowData.forEach((node: any) => {
    labels[node.name] = node.label;
  });

  const series = data?.series;

  if (series.length < 1) {
    return (
      <svg width="100%" height="600">
        <text fill="#DDDDDD" x={width / 2 - 112} y={height / 2 - 24} style={{ font: 'bold 24px sans-serif' }}>
          No data to display.
        </text>
      </svg>
    );
  }
  const svgData = SankeyData.parseData({ series, startNode: flow[0], flow, labels });

  return (
    <svg width="100%" height="600">
      {svgData && <SankeyChart data={svgData} width={width} height={height} />}
    </svg>
  );
};
