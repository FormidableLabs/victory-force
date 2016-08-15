import React from "react";
import {forceLink, forceManyBody, forceX, forceY} from "d3-force";
import { VictoryForce } from "../src/";

import * as tree from "./tree-data";

export default class App extends React.Component {
  state = {
    nodes: tree.nodes,
    links: tree.links
  }

  removeNode(datum) {
    const {nodes, links} = this.state;
    const node = nodes.find((n) => n.index === datum.index);
    this.setState({
      nodes: nodes.filter((n) => n !== node),
      links: links.filter((link) => {
        return link.source.index !== node.index
          && link.target.index !== node.index;
      })
    });
  }

  render() {
    const containerStyle = {
      // display: "flex",
      // flexDirection: "row",
      // flexWrap: "wrap",
      // alignItems: "center",
      // justifyContent: "center"
    };

    const parentStyle = {
      backgroundColor: "#f7f7f7",
      border: "1px solid #ccc",
      maxWidth: 500,
      maxHeight: 500
    };

    return (
      <div>
        <h1>VictoryForce Demo</h1>

        <div style={containerStyle}>
          <div>click a node to remove it (and its links)</div>

          <VictoryForce
            data={this.state.nodes}
            links={this.state.links}
            forces={{
              charge: forceManyBody(),
              link: forceLink(this.state.links).distance(20).strength(1),
              x: forceX(),
              y: forceY()
            }}
            style={{
              parent: parentStyle,
              links: {
                stroke: "rgba(0, 0, 0, 0.2)",
                strokeWidth: 1
              }
            }}
            size={3}
            events={[
              {
                target: "data",
                eventHandlers: {
                  onClick: (e, {datum}) => {
                    this.removeNode(datum);
                  }
                }
              }
            ]}
          />

        </div>
      </div>
    );
  }
}
