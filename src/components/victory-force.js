import React, { PropTypes } from "react";
import { VictoryScatter } from "victory-chart";
import { PropTypes as CustomPropTypes, VictoryContainer } from "victory-core";
import { forceSimulation } from "d3-force";

export default class VictoryForce extends React.Component {
  static propTypes = {
    forces: React.PropTypes.object,
    nodes: React.PropTypes.array,

    height: CustomPropTypes.nonNegative,
    width: CustomPropTypes.nonNegative,
    standalone: PropTypes.bool,
    nodeComponent: PropTypes.element,
    labelComponent: PropTypes.element,
    containerComponent: PropTypes.element,
    groupComponent: PropTypes.element,
    padding: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.shape({
        top: PropTypes.number,
        bottom: PropTypes.number,
        left: PropTypes.number,
        right: PropTypes.number
      })
    ]),
    theme: PropTypes.object
  }

  static defaultProps = {
    width: 400,
    height: 400,
    standalone: true,
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
    return (
      <VictoryScatter
        width={props.width}
        height={props.height}
        data={props.nodes}
        dataComponent={props.nodeComponent}
        labelComponent={props.labelComponent}
        groupComponent={props.groupComponent}
        theme={props.theme}
        animate={false}
        standalone={false}
        padding={props.padding}
      />
    );
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
