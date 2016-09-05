import { range } from "lodash";

const nodes = range(200).map((i) => {
  return {
    index: i
  };
});

const links = range(nodes.length - 1).map((i) => {
  return {
    source: Math.floor(Math.sqrt(i)),
    target: i + 1
  };
});

export { nodes, links };
