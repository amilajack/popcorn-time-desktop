/**
 * Home page component that renders CardsGrid and uses VisibilitySensor
 */
import { connect } from "react-redux";
import { withRouter } from "react-router";
import {
  clearAllItems,
  paginate,
  setLoading,
  setView,
  setLastPage,
} from "./actions";
import Home from "./Home";
import { ItemKind, Item } from "../../api/metadata/MetadataProviderInterface";
import { View } from "./reducer";

type State = {
  home: {
    modes: ItemKind[];
    items: string[];
    isLoading: boolean;
  };
};

function mapStateToProps(state: State) {
  return {
    modes: state.home.modes,
    items: state.home.items,
    isLoading: state.home.isLoading,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    setView: (view: View) => dispatch(setView(view)),
    clearAllItems: () => dispatch(clearAllItems()),
    setLastPage: () => dispatch(setLastPage()),
    paginate: (items: Item[]) => dispatch(paginate(items)),
    setLoading: (isLoading: boolean) => dispatch(setLoading(isLoading)),
  };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Home));
