import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { setView } from "../actions/homePageActions";
import App from "../components/app/App";
import { View } from "../reducers/homePageReducer";

type State = {
  app: {
    view: View;
    modes: View[];
  };
};

function mapStateToProps(state: State) {
  return {
    view: state.app.view,
    modes: state.app.modes,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    setView: (mode: View) => dispatch(setView(mode)),
  };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(App));
