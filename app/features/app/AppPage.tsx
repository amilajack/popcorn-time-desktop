import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import App from "./App";
import { View } from "../home/reducer";

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

export default withRouter(connect(mapStateToProps)(App));
