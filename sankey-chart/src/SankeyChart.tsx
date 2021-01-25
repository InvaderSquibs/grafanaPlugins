import React, { useState } from 'react';
import { sankey, sankeyLinkHorizontal } from 'd3-sankey';
import * as d3 from 'd3';
import chroma from 'chroma-js';

interface Props {
  data: any;
  width: number;
  height: number;
}

const SankeyChart: React.FC<Props> = ({ data, width, height }) => {
  const [hoverText, setHoverText] = useState({ text: '', x: -1, y: -1, anchorPos: '' });

  const { nodes, links } = sankey()
    .nodeWidth(20)
    .nodePadding(10)
    .extent([
      [1, 1],
      [width - 1, height - 5],
    ])(data);

  const color = chroma.scale('Spectral').classes(nodes.length);
  const colorScale = d3
    .scaleLinear()
    .domain([0, nodes.length])
    .range([0, 1]);

  return (
    <g>
      <defs>
        <filter x="0" y="0" width="1" height="1" id="text-background">
          <feFlood floodColor="#000000BB" />
        </filter>
      </defs>
      {links.map((link, i) => (
        <SankeyLink link={link} setHoverText={setHoverText} width={width} color={color(colorScale(i)).hex()} />
      ))}
      {nodes.map((node, i) => (
        <SankeyNode node={node} height={height} width={width} color={color(colorScale(i)).hex()} key={i} />
      ))}
      {hoverText.x > -1 && hoverText.y > -1 && (
        <TextBox text={hoverText.text} x={hoverText.x} y={hoverText.y} anchorPos={hoverText.anchorPos} />
      )}
    </g>
  );
};

interface NodeProps {
  node: any;
  height: number;
  width: number;
  color: any;
}

const SankeyNode: React.FC<NodeProps> = ({ node, width, color }) => {
  const { name, label, value, x0 = 0, x1 = 0, y0 = 0, y1 = 0 } = node;
  const titleXShift = x0 < width * 0.75 ? x1 + 8 : x0 - 8;
  const titleYShift = y0 + (y1 - y0 + 9) / 2;
  const anchorPos = x0 < width * 0.75 ? 'start' : 'end';
  const text = `${label}: ${value}`;

  return (
    <g id={name}>
      <rect x={x0} y={y0} dy=".35em" width={x1 - x0} height={y1 - y0} fill={color} stroke="black">
        <title>{text}</title>
      </rect>
      <TextBox text={text} x={titleXShift} y={titleYShift} anchorPos={anchorPos} />
    </g>
  );
};

interface LinkProps {
  link: any;
  setHoverText(props: any): void;
  color: any;
  width: number;
}

const SankeyLink: React.FC<LinkProps> = ({ link, setHoverText, color, width }) => {
  const { source, target, value } = link;
  const labelXShift = source.x0 < width * 0.75 ? source.x1 + 10 : source.x0 - 10;
  const labelYShift = source.y0 + (source.y1 - source.y0 + 9) / 2 + 24;
  const anchorPos = source.x0 < width * 0.75 ? 'start' : 'end';
  const percent = ((value / source.value) * 100).toFixed(2);

  return (
    <path
      d={sankeyLinkHorizontal()(link) || ''}
      onMouseEnter={e =>
        setHoverText({
          text: `${percent}% (${value}) to ${target.label}`,
          achorPos: anchorPos,
          x: labelXShift,
          y: labelYShift,
        })
      }
      onMouseLeave={() => setHoverText({ text: '', anchorPos: '', x: -1, y: -1 })}
      style={{
        fill: 'none',
        strokeOpacity: 0.3,
        stroke: color,
        strokeWidth: Math.max(1, link.width),
      }}
    />
  );
};

interface TextBoxProps {
  text: string;
  x: number;
  y: number;
  anchorPos: string;
}

const TextBox: React.FC<TextBoxProps> = ({ text, x, y, anchorPos }) => {
  const spacedText = `${text}____`;
  const xShift = anchorPos === 'start' ? x - 8 : x + 8;
  return (
    <>
      <text filter="url(#text-background)" x={xShift} y={y} textAnchor={anchorPos}>
        {spacedText}
      </text>
      <text fill="#DDDDDD" x={x} y={y} textAnchor={anchorPos} style={{ font: 'bold 14px sans-serif' }}>
        {text}
      </text>
    </>
  );
};

export default SankeyChart;
