const parseData = ({ series, startNode, flow }: any) => {
  const { eventList, nodes } = sortEvents(series);
  const userVisitedNode: any = new Set();
  const lastUserEvent: any = {};
  const links: any = {};

  const startIndex = eventList.findIndex((event: any) => {
    return event.eventName === startNode;
  });
  eventList.splice(0, startIndex);

  eventList.forEach((event: any) => {
    const { eventName, userId } = event;
    const visitKey = `${userId}${eventName}`;

    if (!lastUserEvent[userId] && eventName === startNode) {
      lastUserEvent[userId] = eventName;
      userVisitedNode.add(visitKey);
      return;
    }

    if (userVisitedNode.has(visitKey) || !lastUserEvent[userId]) {
      return;
    }

    if (flow.indexOf(eventName) < flow.indexOf(lastUserEvent[userId])) {
      return;
    }

    const source = nodes[lastUserEvent[userId]].index;
    const target = nodes[eventName].index;
    const nodeName = `${source},${target}`;

    if (!links[nodeName]) {
      links[nodeName] = { source, target, value: 0 };
    }

    links[nodeName].value = links[nodeName].value + 1;
    lastUserEvent[userId] = eventName;
    userVisitedNode.add(visitKey);
  });

  return { nodes: Object.values(nodes), links: Object.values(links) };
};

const sortEvents = (series: any): { nodes: any; eventList: any } => {
  const nodes: any = {};
  let nodeIndex = 0;
  const eventList: any = [];

  series.forEach((event: any) => {
    const eventName = event?.name;
    if (!eventName) {
      return;
    }

    const timeField = event?.fields[0];
    const timeList = timeField?.values?.toArray();
    const userIdField = event?.fields[1];
    const userIdList = userIdField?.values?.toArray();

    for (let i = 0; i < timeList.length; i++) {
      const userId = userIdList[i];
      if (!nodes[eventName]) {
        nodes[eventName] = { name: eventName, index: nodeIndex };
        nodeIndex++;
      }

      eventList.push({ eventName, userId, time: timeList[i] });
    }
  });

  eventList.sort((eventA: any, eventB: any) => {
    return eventA.time - eventB.time;
  });

  return { eventList, nodes };
};

export { parseData }
