import React, { PropTypes } from "react";
import { VictoryScatter } from "victory-chart";
import Domain from "victory-chart/lib/helpers/domain";
import {
  PropTypes as CustomPropTypes, VictoryContainer, Helpers } from "victory-core";
import { forceSimulation } from "d3-force";
import { pick } from "lodash";

function Link({x, y, style, datum, scale, accessor}) {
  return (
    <line
      style={style}
      x1={x}
      x2={scale.x(accessor.x(datum.target))}
      y1={y}
      y2={scale.y(accessor.y(datum.target))}
    />);
}

export default class VictoryForce extends React.Component {
  static propTypes = {
    forces: PropTypes.object,
    nodes: PropTypes.array,
    links: PropTypes.array,
    alpha: PropTypes.number,
    alphaDecay: PropTypes.number,

    domain: PropTypes.oneOfType([
      CustomPropTypes.domain,
      PropTypes.shape({
        x: CustomPropTypes.domain,
        y: CustomPropTypes.domain
      })
    ]),
    height: CustomPropTypes.nonNegative,
    width: CustomPropTypes.nonNegative,
    standalone: PropTypes.bool,
    nodeComponent: PropTypes.element,
    linkComponent: PropTypes.element,
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
      nodes: PropTypes.object,
      labels: PropTypes.object,
      links: PropTypes.object
    }),
    events: PropTypes.arrayOf(PropTypes.shape({
      target: PropTypes.oneOf(["data", "labels", "parent"]),
      eventKey: PropTypes.oneOfType([
        PropTypes.func,
        CustomPropTypes.allOfType([CustomPropTypes.integer, CustomPropTypes.nonNegative]),
        PropTypes.string
      ]),
      eventHandlers: PropTypes.object
    })),
    x: PropTypes.oneOfType([
      PropTypes.func,
      CustomPropTypes.allOfType([CustomPropTypes.integer, CustomPropTypes.nonNegative]),
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string)
    ]),
    y: PropTypes.oneOfType([
      PropTypes.func,
      CustomPropTypes.allOfType([CustomPropTypes.integer, CustomPropTypes.nonNegative]),
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string)
    ])
  }

  static defaultProps = {
    x: "x",
    y: "y",
    nodes: [],
    forces: {},
    alpha: 1,
    alphaDecay: 0.06,
    width: 400,
    height: 400,
    standalone: true,
    containerComponent: <VictoryContainer/>,
    groupComponent: <g/>,
    linkComponent: <Link/>
  }

  componentWillMount() {
    this.simulation = forceSimulation(this.props.nodes)
      .on("tick", this.forceUpdate.bind(this))
      .alphaDecay(this.props.alphaDecay);

    this.assignForces(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.nodes !== nextProps.nodes) {
      this.simulation.nodes(nextProps.nodes);
    }

    if (this.props.alphaDecay !== nextProps.alphaDecay) {
      this.simulation.alphaDecay(nextProps.alphaDecay);
    }

    if (this.props.forces !== nextProps.forces) {
      this.assignForces(nextProps);
    }
  }

  componentWillUnmount() {
    this.simulation.stop();
  }

  assignForces(props) {
    Object.keys(props.forces).forEach((key) => {
      const force = props.forces[key];
      this.simulation.force(key, force);
      // TODO: remove previous forces
    });

    // re-heat the simulation and restart the timer
    this.simulation.alpha(props.alpha).restart();
  }

  getProps(props) {
    const {nodes: data, domain, x, y} = props
    const modifiedProps = {data, domain, x, y}
    return {
      ...props,
      domain: {
        x: Domain.getDomain(modifiedProps, "x"),
        y: Domain.getDomain(modifiedProps, "y")
      }
    };
  }

  renderNodes(props) {
    const scatterProps = pick(props, [
      "groupComponent", "height", "width", "domain", "theme", "events", "x",
      "y", "labels", "labelComponent", "size", "padding"
    ]);

    return (
      <VictoryScatter
        {...scatterProps}
        data={props.nodes}
        dataComponent={props.nodeComponent}
        standalone={false}
        style={{
          data: props.style.nodes,
          labels: props.style.labels,
          parent: props.style.parent,
        }}
      />
    );
  }

  renderLinks(props) {
    if (!props.links) {
      return null;
    }

    const scatterProps = pick(props, [
      "groupComponent", "height", "width", "domain", "theme"
    ]);

    const linkComponent = React.cloneElement(props.linkComponent, {
      ...props.linkComponent.props,
      accessor: {
        x: Helpers.createAccessor(props.x),
        y: Helpers.createAccessor(props.y)
      }
    });

    return (
      <VictoryScatter
        {...scatterProps}
        data={props.links}
        standalone={false}
        x={["source", props.x]} // currently doesn't work with function accessor
        y={["source", props.y]}
        dataComponent={linkComponent}
        style={{
          data: props.style.links
        }}
      />
    );
  }

  renderContainer(props, group) {
    return React.cloneElement(
      props.containerComponent,
      { width: props.width, height: props.height, style: props.style.parent },
      group
    );
  }

  renderGroup(nodes, links) {
    return React.cloneElement(
      this.props.groupComponent,
      { role: "presentation" },
      links,
      nodes
    );
  }

  render() {
    const props = this.getProps(this.props);
    const nodes = this.renderNodes(props);
    const links = this.renderLinks(props);
    const group = this.renderGroup(nodes, links);
    return props.standalone ? this.renderContainer(props, group) : group;
  }
}
