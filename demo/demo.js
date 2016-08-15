import React from "react";
import {forceLink, forceManyBody, forceX, forceY} from "d3-force";
import { VictoryForce } from "../src/";

import * as tree from "./tree-data";

export default class App extends React.Component {
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

          <VictoryForce
            data={tree.nodes}
            links={tree.links}
            forces={{
              charge: forceManyBody(),
              link: forceLink(tree.links).distance(20).strength(1),
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
            size={2}
          />

        </div>
      </div>
    );
  }
}
