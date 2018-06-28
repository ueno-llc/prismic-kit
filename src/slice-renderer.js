import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';

/**
 * React component to render a slice zone from a Prismic document. Each slice type maps to one
 * component, and the slice data is passed to the component as props.
 */
export default class SliceRenderer extends Component {

  /**
   * Prop types for `<SliceRenderer />`.
   * @prop {Object.<String, Function>} components - Slice components to use.
   * @prop {Object} passProps - Extra props to pass to every slice.
   * @prop {Object[]} slices - Prismic slice zone contents.
   */
  static propTypes = {
    components: PropTypes.objectOf(PropTypes.func),
    passProps: PropTypes.object,
    slices: PropTypes.arrayOf(PropTypes.object),
  }

  /**
   * Default props for `<SliceZone />`.
   */
  static defaultProps = {
    components: {},
    passProps: {},
    slices: [],
  }

  /**
   * Render a Prismic slice zone as a series of components.
   * @returns {Object} JSX.
   */
  render() {
    const { components, passProps, slices } = this.props;

    return (
      <Fragment>
        {slices.map((slice, index) => {
          const sliceType = slice.slice_type;

          if (sliceType in components) {
            const Slice = components[sliceType];

            // eslint-disable-next-line react/no-array-index-key
            return <Slice {...slice} {...passProps} index={index} key={index} />;
          }

          return null;
        })}
      </Fragment>
    );
  }
}
