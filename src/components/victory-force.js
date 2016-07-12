import React, { PropTypes } from "react";
import { VictoryScatter } from "victory-chart";
import { PropTypes as CustomPropTypes, VictoryContainer } from "victory-core";
import { forceSimulation } from "d3-force";
import omit from "lodash/omit";

export default class VictoryForce extends React.Component {
  static propTypes = {
    forces: React.PropTypes.object,
    data: React.PropTypes.array,

    height: CustomPropTypes.nonNegative,
    width: CustomPropTypes.nonNegative,
    standalone: PropTypes.bool,
    dataComponent: PropTypes.element,
    labelComponent: PropTypes.element,
    labels: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.array
    ]),
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
    theme: PropTypes.object,
    style: PropTypes.shape({
      parent: PropTypes.object,
      data: PropTypes.object,
      labels: PropTypes.object
    }),
    events: PropTypes.arrayOf(PropTypes.shape({
      target: PropTypes.oneOf(["data", "labels", "parent"]),
      eventKey: PropTypes.oneOfType([
        PropTypes.func,
        CustomPropTypes.allOfType([CustomPropTypes.integer, CustomPropTypes.nonNegative]),
        PropTypes.string
      ]),
      eventHandlers: PropTypes.object
    }))
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
      .nodes(this.props.data);

    this.assignForces(this.props.forces);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.data !== nextProps.data) {
      this.simulation.nodes(nextProps.data);
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
    const ownProps = ["containerComponent", "standalone", "animate", "forces"];
    const scatterProps = omit(props, ownProps);
    return (
      <VictoryScatter
        {...scatterProps}
        animate={false}
        standalone={false}
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
      { role: "presentation", style },
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
