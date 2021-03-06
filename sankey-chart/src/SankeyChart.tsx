import React, { useState, useLayoutEffect } from 'react';
import { sankey, sankeyLinkHorizontal } from 'd3-sankey';
import * as d3 from 'd3';
import chroma from 'chroma-js';

interface Props {
  data: any;
  width: number;
  height: number;
}

const SankeyChart: React.FC<Props> = ({ data, width, height }) => {
  const [hoverNode, setHoverNode] = useState<any>(null);
  const [draggingNode, setDraggingNode] = useState<any>(null);
  const [renderNodes, setRenderNodes] = useState<any>(null);
  const [renderLinks, setRenderLinks] = useState<any>(null);

  const color = chroma.scale('Spectral').classes(data?.nodes?.length);
  const colorScale = d3
    .scaleLinear()
    .domain([0, data?.nodes?.length])
    .range([0, 1]);

  const pointerStartMove = (e: React.MouseEvent) => {
    const chartRect = document.querySelector('#sankey-chart');
    const bBox = chartRect?.getBoundingClientRect() || { left: 0, top: 0 };
    const x = e?.clientX - bBox?.left;
    const y = e?.clientY - bBox?.top;
    const node = renderNodes.find((node: any) => x > node.x0 && x < node.x1 && y > node.y0 && y < node.y1);

    if (node) {
      setDraggingNode({ ...node, yStart: y });
    }
  };

  const pointerStopMove = (e: React.MouseEvent) => {
    if (!draggingNode) {
      return;
    }

    const chartRect = document.querySelector('#sankey-chart');
    const bBox = chartRect?.getBoundingClientRect() || { left: 0, top: 0 };
    const xPos = e?.clientX - bBox?.left;
    const yPos = e?.clientY - bBox?.top;
    const yMoved = draggingNode.yStart - yPos;

    draggingNode.x0 = xPos - 10;
    draggingNode.x1 = xPos + 10;
    draggingNode.y0 = draggingNode.y0 - yMoved;
    draggingNode.y1 = draggingNode.y1 - yMoved;

    const newNodes = renderNodes.map((node: any) => (draggingNode.name === node.name ? draggingNode : node));
    const newLinks = renderLinks.map((link: any) => {
      const sourceChanged = link.source.name === draggingNode.name;
      const targetChanged = link.target.name === draggingNode.name;

      if (!sourceChanged && !targetChanged) {
        return link;
      }

      const source = sourceChanged ? draggingNode : link.source;
      const target = targetChanged ? draggingNode : link.target;
      const y0 = sourceChanged ? link.y0 - yMoved : link.y0;
      const y1 = targetChanged ? link.y1 - yMoved : link.y1;

      console.log({ nodeY0: draggingNode.y0, y0, nodeY1: draggingNode.y1, y1 });
      return { ...link, source, target, y0, y1 };
    });

    setDraggingNode(null);
    setRenderNodes(newNodes);
    setRenderLinks(newLinks);
  };

  useLayoutEffect(() => {
    const { nodes, links } = sankey()
      .nodeWidth(20)
      .nodePadding(10)
      .extent([
        [1, 1],
        [width - 1, height - 5],
      ])(data);

    setRenderNodes(nodes);
    setRenderLinks(links);
  }, [data, height, width]);

  return (
    <g id="sankey-chart" onPointerDown={e => pointerStartMove(e)}>
      <defs>
        <filter x="0" y="0" width="1" height="1" id="text-background">
          <feFlood floodColor="#000000AA" />
        </filter>
      </defs>
      <rect fill="none" width={width} height={height} pointerEvents="visible" onPointerUp={e => pointerStopMove(e)} />
      {renderLinks?.length > 0 &&
        renderLinks.map((link: any, i: number) => (
          <SankeyLink
            link={link}
            setHoverNode={setHoverNode}
            width={width}
            color={color(colorScale(i)).hex()}
            endDrag={e => pointerStopMove(e)}
          />
        ))}
      {renderNodes?.length > 0 &&
        renderNodes.map((node: any, i: number) => (
          <SankeyNode node={node} height={height} width={width} color={color(colorScale(i)).hex()} key={i} />
        ))}
      {renderNodes?.length > 0 &&
        renderNodes.map((node: any, i: number) => <LabelText node={node} width={width} hoverNode={hoverNode} />)}
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
  const title = `${label}: ${value}`;

  if (value < 1) {
    return null;
  }

  return (
    <g id={name}>
      <rect x={x0} y={y0} dy=".35em" width={x1 - x0} height={y1 - y0} fill={color} stroke="black">
        <title>{title}</title>
      </rect>
    </g>
  );
};

interface LinkProps {
  link: any;
  setHoverNode(props: any): void;
  color: any;
  width: number;
  endDrag(e: React.PointerEvent): void;
}

const SankeyLink: React.FC<LinkProps> = ({ link, setHoverNode, color, width, endDrag }) => {
  const { source, target, value } = link;
  const percent = ((value / source.value) * 100).toFixed(2);

  return (
    <path
      d={sankeyLinkHorizontal()(link) || ''}
      onMouseEnter={() =>
        setHoverNode({
          name: source.name,
          hoverText: `${percent}% (${value}) to ${target.label}`,
        })
      }
      onMouseLeave={() => setHoverNode(null)}
      onPointerUp={e => endDrag(e)}
      style={{
        fill: 'none',
        strokeOpacity: 0.3,
        stroke: color,
        strokeWidth: Math.max(1, link.width),
      }}
    />
  );
};

interface LabelTextProps {
  node: any;
  hoverNode: any;
  width: number;
}

const LabelText: React.FC<LabelTextProps> = ({ node, hoverNode, width }) => {
  const { label, value, x0 = 0, x1 = 0, y0 = 0, y1 = 0 } = node;
  if (value < 1) {
    return null;
  }

  const titleXShift = x0 < width * 0.75 ? x1 + 8 : x0 - 8;
  const titleYShift = y0 + (y1 - y0 + 9) / 2;
  const anchorPos = x0 < width * 0.75 ? 'start' : 'end';
  const text = `${label}: ${value}`;

  return (
    <>
      <TextBox text={text} x={titleXShift} y={titleYShift} anchorPos={anchorPos} />
      {hoverNode && hoverNode.name === node.name && (
        <TextBox text={hoverNode.hoverText} x={titleXShift} y={titleYShift + 24} anchorPos={anchorPos} />
      )}
    </>
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
