/**
 * Home page component that renders CardList and uses VisibilitySensor
 * @flow
 * @TODO: Use waitForImages plugin to load background images and fade in on load
 */
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as HomeActions from '../actions/homePageActions';
import Home from '../components/home/Home';

function mapStateToProps(state) {
  return {
    activeMode: state.homePageReducer.activeMode,
    activeModeOptions: state.homePageReducer.activeModeOptions,
    modes: state.homePageReducer.modes,
    items: state.homePageReducer.items,
    isLoading: state.homePageReducer.isLoading,
    infinitePagination: false
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(HomeActions, dispatch)
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Home);
