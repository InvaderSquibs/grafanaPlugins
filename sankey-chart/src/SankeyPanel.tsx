import React, { useRef } from 'react';
import { PanelProps } from '@grafana/data';
import { SimpleOptions } from 'types';
import SankeyChart from './SankeyChart';
import * as SankeyData from './SankeyData';

interface Props extends PanelProps<SimpleOptions> {}

export const SankeyPanel: React.FC<Props> = ({ options, data, width, height, replaceVariables }) => {
  const flow = JSON.parse(replaceVariables('$flow'));
  const series = data?.series;
  const svgData = SankeyData.parseData({ series, startNode: 'landing_click_play', flow });
  const svgRef = useRef<SVGSVGElement>(null);

  return (
    <svg width="100%" height="600" ref={svgRef}>
      {svgData && <SankeyChart data={svgData} width={width} height={height} />}
    </svg>
  );
};
