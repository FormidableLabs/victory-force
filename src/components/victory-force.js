import React, { PropTypes } from "react";
import { PropTypes as CustomPropTypes, VictoryContainer } from "victory-core";
import { forceSimulation } from "d3-force";

import Node from "./node";

export default class ForceChart extends React.Component {
  static propTypes = {
    forces: React.PropTypes.object,
    height: CustomPropTypes.nonNegative,
    nodes: React.PropTypes.array,
    width: CustomPropTypes.nonNegative,
    standalone: PropTypes.bool,
    dataComponent: PropTypes.element,
    containerComponent: PropTypes.element,
    groupComponent: PropTypes.element
  }

  static defaultProps = {
    standalone: true,
    dataComponent: <Node />,
    containerComponent: <VictoryContainer/>,
    groupComponent: <g/>
  }

  componentWillMount() {
    this.simulation = forceSimulation()
      .on("tick", this.forceUpdate.bind(this))
      .nodes(this.props.nodes);

    this.assignForces(this.props.forces);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.nodes !== nextProps.nodes) {
      this.simulation.nodes(nextProps.nodes);
    }

    if (this.props.forces !== nextProps.forces) {
      this.assignForces(nextProps.forces);
    }
  }

  componentWillUnmount() {
    this.simulation.stop();
  }

  assignForces(forces) {
    Object.keys(forces).forEach((key) => {
      const force = forces[key];
      this.simulation.force(key, force);
    });

    this.simulation.alpha(1).restart();
  }

  renderData(props) {
    return props.nodes.map((node) => {
      return React.cloneElement(
        props.dataComponent,
        {}
      );
    });
  }

  renderContainer(props, group) {
    return React.cloneElement(
      props.containerComponent,
      {},
      group
    );
  }

  renderGroup(children, style) {
    return React.cloneElement(
      this.props.groupComponent,
      { role: "presentation", style},
      children
    );
  }

  render() {
    const {standalone} = this.props;
    const baseStyle = {};
    const data = this.renderData(this.props);
    const group = this.renderGroup(data, baseStyle.parent);
    return standalone ? this.renderContainer(this.props, group) : group;
  }
}
