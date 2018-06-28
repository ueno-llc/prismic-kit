import 'babel-polyfill';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import chai from 'chai';
import chaiEnzyme from 'chai-enzyme';
import sinonChai from 'sinon-chai';

Enzyme.configure({
  adapter: new Adapter(),
});

chai.use(chaiEnzyme());
chai.use(sinonChai);
