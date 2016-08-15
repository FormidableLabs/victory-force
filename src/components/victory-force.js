import React, { PropTypes } from "react";
import { VictoryScatter } from "victory-chart";
import Domain from "victory-chart/lib/helpers/domain";
import {
  PropTypes as CustomPropTypes, VictoryContainer, Helpers } from "victory-core";
import { forceSimulation } from "d3-force";
import { omit } from "lodash";

function Link({datum, x, y, style, scale, accessor}) {
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
    alpha: React.PropTypes.number,
    alphaDecay: React.PropTypes.number,

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
    });

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
      "containerComponent", "standalone", "animate", "forces", "linkComponent"
    ]);

    return (
      <VictoryScatter
        {...scatterProps}
        standalone={false}
      />
    );
  }

  renderLinks(props) {
    if (!props.links || !props.links.length) {
      return null;
    }

    const scatterProps = omit(props, [
      "containerComponent", "standalone", "animate", "forces", "data", "links",
      "style", "dataComponent", "linkComponent", "events"
    ]);

    const dataComponent = React.cloneElement(props.linkComponent, {
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
        x={["source", props.x]}
        y={["source", props.y]}
        dataComponent={dataComponent}
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
      links,
      data
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
