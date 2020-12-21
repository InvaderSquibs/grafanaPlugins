import React from 'react';
import { sankey, sankeyLinkHorizontal } from 'd3-sankey';
import * as d3 from 'd3';
import chroma from 'chroma-js';

interface Props {
  data: any;
  width: number;
  height: number;
}

const Sankey: React.FC<Props> = ({ data, width, height }) => {
  // const cleanNodes: any[] = [];
  // const nodeMap: any = {};

  // const dNodes = Object.values(data?.nodes);
  // dNodes.forEach((node: any, index: number) => {
  //   cleanNodes[index] = { name: node.name };
  //   nodeMap[node.name] = index;
  // });

  // const cleanLinks = data.links.reduce((agg: any[], link: any) => {
  //   agg.push({ source: nodeMap[link.source], target: nodeMap[link.target], value: link.value });
  //   return agg;
  // }, []);

  const { nodes, links } = sankey()
    .nodeWidth(20)
    .nodePadding(10)
    .extent([
      [1, 1],
      [width - 1, height - 5],
    ])(data);

  const color = chroma.scale('Set3').classes(nodes.length);
  const colorScale = d3
    .scaleLinear()
    .domain([0, nodes.length])
    .range([0, 1]);

  return (
    <g>
      {links.map((link, i) => (
        <SankeyLink link={link} color={color(colorScale(i)).hex()} />
      ))}
      {nodes.map((node, i) => (
        <SankeyNode node={node} width={width} color={color(colorScale(i)).hex()} key={i} />
      ))}
    </g>
  );
};

interface NodeProps {
  node: any;
  width: number;
  color: any;
}

const SankeyNode: React.FC<NodeProps> = ({ node, width, color }) => {
  const { name, x0 = 0, x1 = 0, y0 = 0, y1 = 0 } = node;
  const titleXShift = x0 < width / 2 ? x1 + 8 : x0 - 8;
  const titleYShift = y0 + (y1 - y0 + 9) / 2;
  const anchorPos = x0 < width / 2 ? 'start' : 'end';

  console.log({ color });

  return (
    <>
      <rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} fill={color} stroke="black">
        <title>{name}</title>
      </rect>
      <text
        fill="#cccccc"
        x={titleXShift}
        y={titleYShift}
        textAnchor={anchorPos}
        style={{ font: 'bold 18px sans-serif' }}
      >
        {name}
      </text>
    </>
  );
};

interface LinkProps {
  link: any;
  color: any;
}

const SankeyLink: React.FC<LinkProps> = ({ link, color }) => (
  <path
    d={sankeyLinkHorizontal()(link) || ''}
    style={{
      fill: 'none',
      strokeOpacity: 0.3,
      stroke: color,
      strokeWidth: Math.max(1, link.width),
    }}
  />
);

export default Sankey;
