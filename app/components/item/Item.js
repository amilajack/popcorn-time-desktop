// @flow
import React, { PropTypes } from 'react';
import {
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from 'reactstrap';
import { Link } from 'react-router';
import classNames from 'classnames';
import CardList from '../card/CardList';
import Rating from '../card/Rating';
import Show from '../show/Show';


const SUMMARY_CHAR_LIMIT: number = 300;

export default function Item(props: Object) {
  const {
    item,
    idealTorrent,
    torrent,
    servingUrl,
    activeMode,
    toggle,
    torrentInProgress,
    fetchingTorrents,
    dropdownOpen,
    currentPlayer,
    selectShow,
    seasons,
    selectedSeason,
    episodes,
    selectedEpisode,
    similarItems,
    similarLoading,
    isFinished,
    playbackIsActive,
    stopPlayback,
    toggleActive,
    startPlayback,
    setPlayer
  } = props;

  const torrentLoadingStatusStyle = { color: 'maroon' };

  const statusColorStyle = {
    backgroundColor: (() => {
      switch (idealTorrent.health) {
        case 'healthy':
          return 'green';
        case 'decent':
          return 'yellow';
        default:
          return 'red';
      }
    })()
  };

  const itemBackgroundUrl = {
    backgroundImage: [
      `-webkit-image-set(url(${item.images.fanart.thumb}) 1x,`,
      `url(${item.images.fanart.medium}) 2x,`,
      `url(${item.images.fanart.full}) 3x`
    ].join('')
  };

  return (
    <div
      className={classNames('container-fluid', 'Item', {
        active: playbackIsActive
      })}
    >
      <Link to="/">
        <button
          className="btn btn-back"
          onClick={() => stopPlayback()}
        >
          Back
        </button>
      </Link>
      <div className="row">

        <div className="plyr col-xs-12">
          <video controls poster={item.images.fanart.full} />
        </div>

        <div
          className="col-xs-12 Item--background"
          style={itemBackgroundUrl}
        >

          <div className="col-xs-6 Item--image">
            <img
              height="350px"
              width="233px"
              role="presentation"
              src={item.images.poster.thumb}
              onClick={() => toggleActive()}
            />
          </div>

          <div className="Movie col-xs-6">
            <h1 className="row-margin" id="title">
              {item.title}
            </h1>
            <div className="row">
              <span className="col-xs-3" id="runtime">
                <h6>
                  {item.runtime.hours ? `${item.runtime.hours} hrs ` : ''}
                  {item.runtime.minutes ? `${item.runtime.minutes} min` : ''}
                </h6>
              </span>
              <span className="col-xs-9" id="genres">
                {item.genres
                  ? <h6>{item.genres.join(', ')}</h6>
                  : null}
              </span>
            </div>
            {/* HACK: Prefer a CSS solution to this, using text-overflow: ellipse */}
            <h6 className="row-margin" id="summary">
              {item.summary
                ? item.summary.length > SUMMARY_CHAR_LIMIT
                    ? `${item.summary.slice(0, SUMMARY_CHAR_LIMIT)}...`
                    : item.summary
                : ''}
            </h6>
            <div className="row row-margin row-flex-center">
              <div className="col-xs-4">
                {item.rating
                  ? <Rating
                    emptyStarColor={'rgba(255, 255, 255, 0.2)'}
                    starColor={'white'}
                    rating={item.rating}
                  />
                  : null}
              </div>
              <div className="col-xs-1">
                <h6>{item.year}</h6>
              </div>

              <div className="col-xs-3">
                {item.certification
                  ? <div className="certification">{item.certification}</div>
                  : null}
              </div>

              <div className="col-xs-3 Movie--status-container">
                <i className="ion-magnet" />
                <div className="Movie--status" style={statusColorStyle} />
              </div>
            </div>
          </div>

          <div className="Item--overlay" />
        </div>

        {/* Torrent Selection */}
        <span>
          <button
            onClick={() => startPlayback(
              idealTorrent.magnet,
              idealTorrent.method
            )}
            disabled={!idealTorrent.magnet}
          >
            Start Ideal Torrent
          </button>
        </span>
        {(() => {
          if (process.env.FLAG_MANUAL_TORRENT_SELECTION === 'true') {
            return (
              <span>
                <button
                  onClick={() => startPlayback(
                    torrent['1080p'].magnet,
                    torrent['1080p'].method
                  )}
                  disabled={!torrent['1080p'].quality}
                >
                  Start 1080p -- {torrent['1080p'].seeders} seeders
                </button>
                <button
                  onClick={() => startPlayback(
                    torrent['720p'].magnet,
                    torrent['720p'].method
                  )}
                  disabled={!torrent['720p'].quality}
                >
                  Start 720p -- {torrent['720p'].seeders} seeders
                </button>
                {(() => {
                  if (activeMode === 'shows') {
                    return (
                      <button
                        onClick={() => startPlayback(
                          torrent['480p'].magnet,
                          torrent['480p'].method
                        )}
                        disabled={!torrent['480p'].quality}
                      >
                        Start 480p -- {torrent['480p'].seeders} seeders
                      </button>
                    );
                  }

                  return null;
                })()}
              </span>
            );
          }

          return null;
        })()}
        <h3 style={torrentLoadingStatusStyle}>
          {!servingUrl && torrentInProgress
            ? 'Loading torrent...'
            : null}
        </h3>
        <h3 style={torrentLoadingStatusStyle}>
          {fetchingTorrents
            ? 'Fetching torrents...'
            : null}
        </h3>
        <div className="row">
          <div className="col-xs-12">
            <Dropdown isOpen={dropdownOpen} toggle={toggle}>
              <DropdownToggle caret>
                {currentPlayer || 'Default'}
              </DropdownToggle>
              <DropdownMenu>
                <DropdownItem header>Select Player</DropdownItem>
                <DropdownItem
                  onClick={() => setPlayer('Default')}
                >
                  Default
                </DropdownItem>
                <DropdownItem
                  onClick={() => setPlayer('VLC')}
                >
                  VLC
                </DropdownItem>
                {process.env.FLAG_CASTING === 'true'
                  ? <DropdownItem
                    onClick={setPlayer('Chromecast')}
                  >
                    Chromecast
                  </DropdownItem>
                  : null}
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
        <button className="btn btn-info" onClick={() => toggleActive()}>
          Toggle Hover Playback Active
        </button>
        {activeMode === 'shows'
          ? <Show
            selectShow={selectShow}
            seasons={seasons}
            episodes={episodes}
            selectedSeason={selectedSeason}
            selectedEpisode={selectedEpisode}
          />
          : null}

        <div className="col-xs-12">
          <CardList
            title={'similar'}
            limit={4}
            items={similarItems}
            metadataLoading={similarLoading}
            isFinished={isFinished}
          />
        </div>
      </div>
    </div>
  );
}

Item.propTypes = {
  activeMode: PropTypes.string.isRequired,
  currentPlayer: PropTypes.string.isRequired,
  toggle: PropTypes.func.isRequired,
  dropdownOpen: PropTypes.func.isRequired,
  selectShow: PropTypes.func.isRequired,
  torrentInProgress: PropTypes.bool.isRequired,
  fetchingTorrents: PropTypes.bool.isRequired,
  servingUrl: PropTypes.string,
  seasons: PropTypes.arrayOf(PropTypes.shape({
    season: PropTypes.string.isRequired
  })),
  selectedSeason: PropTypes.number,
  episodes: PropTypes.arrayOf(PropTypes.shape({
    episode: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired
  })),
  selectedEpisode: PropTypes.number,
  similarItems: PropTypes.arrayOf(PropTypes.shape({
    itemId: PropTypes.string.isRequired
  })),
  similarLoading: PropTypes.bool,
  isFinished: PropTypes.bool,
  playbackIsActive: PropTypes.bool,
  stopPlayback: PropTypes.func.isRequired,
  toggleActive: PropTypes.func.isRequired,
  startPlayback: PropTypes.func.isRequired,
  setPlayer: PropTypes.func.isRequired,
  torrent: PropTypes.shape({
    health: PropTypes.string
  }),
  idealTorrent: PropTypes.shape({
    health: PropTypes.string
  }),
  item: PropTypes.shape({
    itemId: PropTypes.string.isRequired
  })
};

Item.defaultProps = {
  activeMode: 'movies'
};
