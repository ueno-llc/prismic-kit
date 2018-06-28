import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import SliceRenderer from '../src/slice-renderer';

const slices = [
  {
    slice_type: 'one',
    slice_label: null,
    primary: {
      kittens: true,
    },
    items: [{
      puppies: false,
    }],
  },
];

const One = () => <div />;

describe('<SliceRenderer />', () => {
  it('renders a component for each slice', () => {
    const wrapper = shallow((
      <SliceRenderer components={{ one: One }} slices={slices} />
    ));

    expect(wrapper.find(One)).to.have.lengthOf(1);
  });

  it('renders null if no component matches a slice', () => {
    const wrapper = shallow((
      <SliceRenderer
        components={{ one: One }}
        slices={[
          ...slices,
          { slice_type: 'two' },
        ]}
      />
    ));

    expect(wrapper.children()).to.have.lengthOf(1);
  });

  it('passes slice data to the component as props', () => {
    const wrapper = shallow((
      <SliceRenderer components={{ one: One }} slices={slices} />
    ));
    const slice = wrapper.find(One).first();

    expect(slice).to.have.props(slices[0]);
  });

  it('passes an index prop', () => {
    const wrapper = shallow((
      <SliceRenderer components={{ one: One }} slices={slices} />
    ));
    const slice = wrapper.find(One).first();

    expect(slice).to.have.prop('index', 0);
  });

  it('can pass extra props to slice components', () => {
    const wrapper = shallow((
      <SliceRenderer components={{ one: One }} slices={slices} passProps={{ kittens: true }} />
    ));
    const slice = wrapper.find(One).first();

    expect(slice).to.have.prop('kittens', true);
  });
});
