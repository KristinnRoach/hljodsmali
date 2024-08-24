/* __________________  CONNECT / DISCONNECT NODES __________________  */

export const connectNodeChain = (nodes: AudioNode[]): void => {
  if (nodes.length === 0) {
    throw new Error('Nodes array is empty!');
  }
  for (let i = 0; i < nodes.length - 1; i++) {
    nodes[i].connect(nodes[i + 1]);
  }
};

export const disconnectNodes = (nodes: AudioNode[]): void => {
  nodes.forEach((node) => node.disconnect());
};

// Connects multiple audio nodes directly to a single destination node in parallel without chaining them.
export const connectNodesParalell = (
  nodes: AudioNode[],
  destination: AudioNode
): void => {
  nodes.forEach((node) => node.connect(destination));
};

export const disconnectNodesFromDestination = (
  nodes: AudioNode[],
  destination: AudioNode
): void => {
  nodes.forEach((node) => node.disconnect(destination));
};

// modulate a single parameter (like gain or frequency) with multiple audio signals simultaneously.
export const connectNodesToParam = (
  nodes: AudioNode[],
  param: AudioParam
): void => {
  nodes.forEach((node) => node.connect(param));
};

export const disconnectNodesFromParam = (
  nodes: AudioNode[],
  param: AudioParam
): void => {
  nodes.forEach((node) => node.disconnect(param));
};

export const createNodeChain = (nodes: AudioNode[]): AudioNode[] => {
  for (let i = 0; i < nodes.length - 1; i++) {
    nodes[i].connect(nodes[i + 1]);
  }
  return nodes;
};

export const isNodeConnected = (node: AudioNode): boolean => {
  return node.numberOfOutputs > 0 && node.numberOfOutputs > 0;
};
