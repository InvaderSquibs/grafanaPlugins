import React, { useRef } from 'react';
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
  const svgData = SankeyData.parseData({ series, startNode: 'landing_click_play', flow, labels });
  const svgRef = useRef<SVGSVGElement>(null);

  return (
    <svg width="100%" height="600" ref={svgRef}>
      {svgData && <SankeyChart data={svgData} width={width} height={height} />}
    </svg>
  );
};
