import React, { PropTypes } from "react";
import { VictoryScatter } from "victory-chart";
import Domain from "victory-chart/lib/helpers/domain";
import {
  PropTypes as CustomPropTypes, VictoryContainer, Helpers } from "victory-core";
import { forceSimulation } from "d3-force";
import { omit, pick } from "lodash";

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
    data: PropTypes.array,
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
    dataComponent: PropTypes.element,
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
      data: PropTypes.object,
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
    data: [],
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
    this.simulation = forceSimulation()
      .on("tick", this.forceUpdate.bind(this))
      .nodes(this.props.data)
      .alphaDecay(this.props.alphaDecay);

    this.assignForces(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.data !== nextProps.data) {
      this.simulation.nodes(nextProps.data);
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
    return {
      ...props,
      domain: {
        x: Domain.getDomain(props, "x"),
        y: Domain.getDomain(props, "y")
      }
    };
  }

  renderData(props) {
    const scatterProps = omit(props, [
      "containerComponent", "standalone", "animate", "forces", "linkComponent",
      "alpha", "alphaDecay", "style"
    ]);

    return (
      <VictoryScatter
        {...scatterProps}
        standalone={false}
        style={pick(props.style, ["labels", "data"])}
      />
    );
  }

  renderLinks(props) {
    if (!props.links || !props.links.length) {
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

  renderGroup(data, links) {
    return React.cloneElement(
      this.props.groupComponent,
      { role: "presentation" },
      links,
      data
    );
  }

  render() {
    const props = this.getProps(this.props);
    const data = this.renderData(props);
    const links = this.renderLinks(props);
    const group = this.renderGroup(data, links);
    return props.standalone ? this.renderContainer(props, group) : group;
  }
}
