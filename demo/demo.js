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
    this.setState({
      nodes: nodes.filter((node) => node.index !== datum.index),
      links: links.filter(({source, target}) => {
        return source.index !== datum.index && target.index !== datum.index;
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
            nodes={this.state.nodes}
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
