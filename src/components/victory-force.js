import React, { PropTypes } from "react";
import { VictoryScatter } from "victory-chart";
import Domain from "victory-chart/lib/helpers/domain";
import {
  PropTypes as CustomPropTypes, VictoryContainer, Helpers } from "victory-core";
import { forceSimulation } from "d3-force";
import { omit } from "lodash";

function Link({datum, xAccessor, yAccessor, x, y, style, scale}) {
  const accessor = {
    x: Helpers.createAccessor(xAccessor),
    y: Helpers.createAccessor(yAccessor)
  };
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
    forces: React.PropTypes.object,
    data: React.PropTypes.array,
    links: React.PropTypes.array,

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
    links: [],
    forces: {},
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
    const otherProps = [
      "containerComponent", "standalone", "animate", "forces", "linkComponent"
    ];
    const scatterProps = omit(props, otherProps);
    return (
      <VictoryScatter
        {...scatterProps}
        standalone={false}
      />
    );
  }

  renderLinks(props) {
    const otherProps = [
      "containerComponent", "standalone", "animate", "forces", "data", "links",
      "style", "dataComponent", "linkComponent"
    ];
    const scatterProps = omit(props, otherProps);
    return (
      <VictoryScatter
        {...scatterProps}
        data={props.links}
        standalone={false}
        x={["source", props.x]}
        y={["source", props.y]}
        dataComponent={React.cloneElement(props.linkComponent, {
          ...props.linkComponent.props,
          xAccessor: props.x,
          yAccessor: props.y
        })}
        style={{
          ...props.style,
          data: props.style.links
        }}
      />
    );
  }

  renderContainer(props, group) {
    return React.cloneElement(
      props.containerComponent,
      {width: props.width, height: props.height, style: props.style.parent},
      group
    );
  }

  renderGroup(data, links, style) {
    return React.cloneElement(
      this.props.groupComponent,
      { role: "presentation", style },
      data,
      links
    );
  }

  render() {
    const props = this.getProps(this.props);
    const baseStyle = {};
    const data = this.renderData(props);
    const links = this.renderLinks(props);
    const group = this.renderGroup(data, links, baseStyle.parent);
    return props.standalone ? this.renderContainer(props, group) : group;
  }
}
