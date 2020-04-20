import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { setActiveMode } from "../actions/homePageActions";
import App from "../components/app/App";
import { ActiveMode } from "../reducers/homePageReducer";

type State = {
  app: {
    activeMode: ActiveMode;
    modes: ActiveMode[];
  };
};

function mapStateToProps(state: State) {
  return {
    activeMode: state.app.activeMode,
    modes: state.app.modes,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    setActiveMode: (mode: ActiveMode) => dispatch(setActiveMode(mode)),
  };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(App));
