/* eslint-disable react/no-did-mount-set-state, react/no-did-update-set-state */

import { PureComponent } from 'react';
import Prismic from 'prismic-javascript';
import PropTypes from 'prop-types';
import getCookie from './get-cookie';

export default class PrismicPreviewLoader extends PureComponent {

  static propTypes = {
    children: PropTypes.node,
  }

  static defaultProps = {
    children: null,
  }

  state = {
    hidden: false,
  }

  componentDidMount() {
    // If we're in Prismic preview mode, unmount the app so we can force all the fetching jobs
    // to happen again
    if (getCookie(Prismic.previewCookie)) {
      this.setState({
        hidden: true,
      });
    }
  }

  componentDidUpdate() {
    if (this.state.hidden) {
      this.setState({
        hidden: false,
      });
    }
  }

  render() {
    const { children } = this.props;
    const { hidden } = this.state;

    if (hidden) {
      return null;
    }

    return children;
  }
}
