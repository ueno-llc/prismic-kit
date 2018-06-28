/* eslint-env mocha */

import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import PreviewLoader from '../src/preview-loader';

describe('<PreviewLoader />', () => {
  it('renders its children', () => {
    const wrapper = shallow((
      <PreviewLoader>
        <div />
      </PreviewLoader>
    ));

    expect(wrapper.find('div')).to.have.lengthOf(1);
  });
});
