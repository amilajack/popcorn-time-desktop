/* eslint react/no-unused-prop-types: off */
import React, { Component } from "react";
import { Col, Row } from "reactstrap";
import VisibilitySensor from "react-visibility-sensor";
import Carousel from "nuka-carousel";
import { Link } from "react-router-dom";
import { Location, History } from "history";
import _ from "lodash";
import { IonIcon } from "@ionic/react";
import { arrowBack, arrowForward } from "ionicons/icons";
import Butter from "../../api/Butter";
import CardsGrid from "../card/CardsGrid";
import Description from "../item/Description";
import SaveItem from "../item/SaveItem";
import Poster from "../item/Poster";
import { Item } from "../../api/metadata/MetadataProviderInterface";
import { PageInfo, View } from "./reducer";
import { RouterProps } from "../../types/match";

interface Props extends RouterProps {
  paginate: (items: Item[]) => void;
  clearAllItems: () => void;
  setLoading: (isLoading: boolean) => void;
  setLastPage: () => void;
  setView: (view: View) => void;
  history: History;
  view: View;
  location: Location<{
    searchQuery?: string;
  }>;
  modes: Record<View, PageInfo>;
  items: Array<Item>;
  isLoading: boolean;
}

type State = {
  favorites: Array<Item>;
  watchList: Array<Item>;
  trending: Array<Item>;
  recentlyWatched: Array<Item>;
};

class Home extends Component<Props, State> {
  state: State = {
    favorites: [],
    watchList: [],
    trending: [],
    recentlyWatched: [],
  };

  butter: Butter = new Butter();

  /**
   * If bottom of component is 2000px from viewport, query
   */
  infinitePagination = _.throttle(() => {
    const { match } = this.props;
    const { view } = match.params;
    if (view && view !== View.Home) {
      const { isLoading } = this.props;
      const scrollDimentions = document.body.getBoundingClientRect();
      if (scrollDimentions.bottom < 2_000 && !isLoading) {
        this.paginate(view);
      }
    }
  }, 1_000);

  async componentDidMount() {
    const { setView, match } = this.props;
    setView(match.params.view || View.Home);

    const [
      favorites,
      watchList,
      recentlyWatched,
      trending,
    ] = await Promise.all([
      this.butter.favorites.get(),
      this.butter.watchList.get(),
      this.butter.recentlyWatched.get(),
      this.butter.getTrending(),
    ]);

    this.setState({
      favorites,
      watchList,
      recentlyWatched,
      trending,
    });

    import("mousetrap")
      .then((mousetrap) => {
        mousetrap.bind(["mod+f"], () => {
          window.scrollTo(0, 0);
          const searchElm = document.getElementById("pct-search-input");
          if (searchElm) {
            searchElm.focus();
          } else {
            throw new Error("search element not found");
          }
        });

        const { history } = this.props;

        mousetrap.bind(["mod+1"], () => {
          history.push("/home");
        });

        mousetrap.bind(["mod+2"], () => {
          history.push("/movies");
        });

        mousetrap.bind(["mod+3"], () => {
          history.push("/shows");
        });

        return true;
      })
      .catch(console.log);

    document.addEventListener("scroll", this.infinitePagination);
  }

  // eslint-disable-next-line camelcase
  async UNSAFE_componentWillReceiveProps(nextProps: Props) {
    const { clearAllItems, setView, match, location } = this.props;
    const { view: nextView } = nextProps.match.params;
    const { view } = match.params;

    if (view !== nextView && nextView) {
      setView(nextView);
    }

    if (view === "search") {
      const searchQuery = location.state?.searchQuery || "";
      const nextSearchQuery = nextProps.location?.state?.searchQuery || "";
      if (searchQuery !== nextSearchQuery) {
        clearAllItems();
        await this.paginate(view, nextProps);
      }
    }
  }

  componentWillUnmount() {
    document.removeEventListener("scroll", this.infinitePagination);
  }

  onChange = async (isVisible: boolean) => {
    const { isLoading, match } = this.props;
    const { view } = match.params;
    if (isVisible && !isLoading) {
      await this.paginate(view);
    }
  };

  /**
   * Query items and add them to redux store
   */
  async paginate(view: View = View.Home, props?: Props): Promise<void> {
    const { modes, paginate, setLoading, setLastPage, location } =
      props || this.props;

    if (modes[view].isLastPage) return;

    setLoading(true);

    try {
      const items = await (async () => {
        const { page } = modes[view];
        switch (view) {
          case "search": {
            const searchQuery = new URLSearchParams(location.search).get(
              "searchQuery"
            );
            if (!searchQuery) {
              throw new Error("searchQuery must be set");
            }
            return this.butter.search(searchQuery, page);
          }
          case View.Movie:
            return this.butter.getMovies(page);
          case View.Show:
            return this.butter.getShows(page);
          default:
            return this.butter.getMovies(page);
        }
      })();
      // @HACK A temporary workaround for detecting the last page
      if (items.length) {
        paginate(items);
      } else {
        setLastPage();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  render() {
    const { items, isLoading, match } = this.props;
    const { favorites, watchList, recentlyWatched, trending } = this.state;
    const { view } = match.params;

    const home = (
      <>
        <Row>
          <Carousel
            renderCenterLeftControls={({ previousSlide }) => (
              <button type="button" onClick={previousSlide}>
                <IonIcon icon={arrowBack} />
              </button>
            )}
            renderCenterRightControls={({ nextSlide }) => (
              <button type="button" onClick={nextSlide}>
                <IonIcon icon={arrowForward} />
              </button>
            )}
            defaultControlsConfig={{
              pagingDotsStyle: { fill: "white" },
            }}
            autoplay
            wrapAround
            pauseOnHover={false}
          >
            {trending.map((item) => (
              <Row key={item.id} className="Item">
                <Col
                  sm="12"
                  className="Item--background"
                  style={{
                    backgroundImage: `url(${item.images.fanart?.full || ""})`,
                  }}
                >
                  <Col sm="6" className="Item--image">
                    <Link to={`/${item.type}/${item.id}`}>
                      <Poster image={item.images.poster?.thumb || ""} />
                    </Link>
                    <SaveItem
                      item={item}
                      favorites={favorites}
                      watchList={watchList}
                    />
                  </Col>
                  <Description
                    certification={item.certification}
                    genres={item.genres}
                    seederCount={0}
                    rating={item.rating}
                    runtime={item.runtime}
                    summary={item.summary}
                    title={item.title}
                    torrentHealth="healthy"
                    trailer={item.trailer}
                    year={item.year}
                    showTorrentInfo={false}
                  />
                  <div className="Item--overlay" />
                </Col>
              </Row>
            ))}
          </Carousel>
        </Row>
        <Row>
          <Col sm="12">
            <CardsGrid title="Recently Watched" items={recentlyWatched} />
          </Col>
        </Row>
        <Row>
          <Col sm="12">
            <CardsGrid title="Favorites" items={favorites} />
          </Col>
        </Row>
        <Row>
          <Col sm="12">
            <CardsGrid title="Watch List" items={watchList} />
          </Col>
        </Row>
      </>
    );

    return (
      <>
        <Row>
          <Col sm="12">
            {view === View.Home || !view ? (
              home
            ) : (
              <CardsGrid items={items} isLoading={isLoading} />
            )}
          </Col>
        </Row>
        <Row>
          <VisibilitySensor
            active={view && view !== View.Home}
            onChange={this.onChange}
          >
            {/* A hack to make `react-visibility-sensor` work */}
            <div style={{ opacity: 0 }}>Loading</div>
          </VisibilitySensor>
        </Row>
      </>
    );
  }
}

export default Home;
