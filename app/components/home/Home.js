//
/* eslint react/no-unused-prop-types: 0 */
import React, { Component } from "react";
import { Col, Row } from "reactstrap";
import VisibilitySensor from "react-visibility-sensor";
import Carousel from "nuka-carousel";
import { Link } from "react-router-dom";
import Butter from "../../api/Butter";
import Navbar from "../navbar/Navbar";
import CardsGrid from "../card/CardsGrid";
import Description from "../item/Description";
import SaveItem from "../metadata/SaveItem";
import Poster from "../item/Poster";

export type activeModeOptionsType = {
  [option: string]: number | boolean | string,
};

export type itemType = {
  title: string,
  id: string,
  year: number,
  type: string,
  rating: number,
  genres: Array<string>,
};

type Props = {
  theme: string,
  setActiveMode: (
    mode: string,
    activeModeOptions?: activeModeOptionsType
  ) => void,
  paginate: (
    activeMode: string,
    activeModeOptions?: activeModeOptionsType
  ) => void,
  clearAllItems: () => void,
  setLoading: (isLoading: boolean) => void,
  activeMode: string,
  activeModeOptions: activeModeOptionsType,
  modes: {
    movies: {
      page: number,
      limit: number,
      items: {
        title: string,
        id: string,
        year: number,
        type: string,
        rating: number,
        genres: Array<string>,
      },
    },
  },
  items: Array<itemType>,
  isLoading: boolean,
  infinitePagination: boolean,
};

type State = {
  favorites: Array<itemType>,
  watchList: Array<itemType>,
  trending: Array<itemType>,
};

export default class Home extends Component<Props, State> {
  props: Props;

  state: State = {
    favorites: [],
    watchList: [],
    trending: [],
  };

  butter: Butter;

  constructor(props: Props) {
    super(props);
    this.butter = new Butter();

    // Temporary hack to preserve scroll position
    if (!global.pct) {
      global.pct = {
        moviesScrollTop: 0,
        showsScrollTop: 0,
        searchScrollTop: 0,
        homeScrollTop: 0,
      };
    }
  }

  /**
   * Return movies and finished status without mutation
   * @TODO: Migrate this to redux
   * @TODO: Determine if query has reached last page
   *
   * @param {string} queryType   | 'search', 'movies', 'shows', etc
   * @param {object} queryParams | { searchQuery: 'game of thrones' }
   */
  async paginate(
    queryType: string,
    activeModeOptions: activeModeOptionsType = {}
  ) {
    const { modes, paginate, setLoading } = this.props;

    setLoading(true);

    // HACK: This is a temporary solution.
    // Waiting on: https://github.com/yannickcr/eslint-plugin-react/issues/818

    const { limit, page } = modes[queryType];

    const items = await (async () => {
      switch (queryType) {
        case "search": {
          return this.butter.search(activeModeOptions.searchQuery, page);
        }
        case "movies":
          return this.butter.getMovies(page, limit);
        case "shows":
          return this.butter.getShows(page, limit);
        default:
          return this.butter.getMovies(page, limit);
      }
    })();

    paginate(items);
    setLoading(false);

    return items;
  }

  /**
   * If bottom of component is 2000px from viewport, query
   */
  initInfinitePagination = () => {
    const {
      infinitePagination,
      activeMode,
      activeModeOptions,
      isLoading,
    } = this.props;

    if (infinitePagination) {
      const scrollDimentions = document
        .querySelector("body")
        .getBoundingClientRect();
      if (scrollDimentions.bottom < 2000 && !isLoading) {
        this.paginate(activeMode, activeModeOptions);
      }
    }
  };

  async componentDidMount() {
    const { activeMode } = this.props;

    document.addEventListener("scroll", this.initInfinitePagination);
    window.scrollTo(0, global.pct[`${activeMode}ScrollTop`]);

    const [
      favorites,
      watchList,
      recentlyWatched,
      trending,
    ] = await Promise.all([
      this.butter.favorites("get"),
      this.butter.watchList("get"),
      this.butter.recentlyWatched("get"),
      this.butter.getTrending(),
    ]);

    this.setState({
      favorites,
      watchList,
      recentlyWatched,
      trending,
    });
  }

  // eslint-disable-next-line camelcase
  UNSAFE_componentWillReceiveProps(nextProps: Props) {
    const { activeMode, activeModeOptions, clearAllItems } = this.props;
    global.pct[`${activeMode}ScrollTop`] = document.body.scrollTop;

    if (activeMode !== nextProps.activeMode) {
      window.currentCardSelectedIndex = 0;
    }

    if (
      JSON.stringify(nextProps.activeModeOptions) !==
      JSON.stringify(activeModeOptions)
    ) {
      if (nextProps.activeMode === "search") {
        clearAllItems();
      }

      this.paginate(nextProps.activeMode, nextProps.activeModeOptions);
    }
  }

  componentDidUpdate(prevProps: Props) {
    const { activeMode } = this.props;
    if (prevProps.activeMode !== activeMode) {
      window.scrollTo(0, global.pct[`${activeMode}ScrollTop`]);
    }
  }

  componentWillUnmount() {
    const { activeMode } = this.props;
    if (!document.body) {
      throw new Error(
        '"document" not defined. You are probably not running in the renderer process'
      );
    }

    global.pct[`${activeMode}ScrollTop`] = document.body.scrollTop;

    document.removeEventListener("scroll", this.initInfinitePagination);
  }

  onChange = async (isVisible: boolean) => {
    const { isLoading, activeMode, activeModeOptions } = this.props;
    if (isVisible && !isLoading) {
      await this.paginate(activeMode, activeModeOptions);
    }
  };

  render() {
    const { activeMode, items, isLoading, setActiveMode, theme } = this.props;
    const { favorites, watchList, recentlyWatched, trending } = this.state;

    const home = (
      <>
        <Row>
          <Carousel
            renderCenterLeftControls={({ previousSlide }) => (
              <button type="button" onClick={previousSlide}>
                <i className="ion-md-arrow-back" />
              </button>
            )}
            renderCenterRightControls={({ nextSlide }) => (
              <button type="button" onClick={nextSlide}>
                <i className="ion-md-arrow-forward" />
              </button>
            )}
            defaultControlsConfig={{
              pagingDotsStyle: { fill: "white" },
            }}
            autoplay
            autoplayReverse
          >
            {trending.map((item) => (
              <Row key={item.id} className="Item">
                <Col
                  sm="12"
                  className="Item--background"
                  style={{ backgroundImage: `url(${item.images.fanart.full})` }}
                >
                  <Col sm="6" className="Item--image">
                    <Link replace to={`/item/${item.type}/${item.id}`}>
                      <Poster
                        magnetLink=""
                        onClick={() => this.navigateToItem(item.type, item.id)}
                        poster={item.images.poster.thumb}
                      />
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
                    onTrailerClick={() => this.setPlayer("youtube")}
                    rating={item.rating}
                    runtime={item.runtime}
                    summary={item.summary}
                    title={item.title}
                    torrentHealth={0}
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
          <Navbar
            activeMode={activeMode}
            setActiveMode={setActiveMode}
            theme={theme}
          />
        </Row>
        <Row>
          <Col sm="12">
            {activeMode === "home" ? (
              home
            ) : (
              <CardsGrid items={items} isLoading={isLoading} />
            )}
          </Col>
        </Row>
        <Row>
          <VisibilitySensor onChange={this.onChange}>
            {/* A hack to make `react-visibility-sensor` work */}
            <div style={{ opacity: 0 }}>Loading</div>
          </VisibilitySensor>
        </Row>
      </>
    );
  }
}
