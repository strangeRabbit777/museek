import os from 'os';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Input from 'react-simple-input';
import KeyBinding from 'react-keybinding-component';

import PlayingBar from './PlayingBar.react';
import WindowControls from './WindowControls.react';
import PlayerControls from './PlayerControls.react';

import * as LibraryActions from '../../actions/LibraryActions';
import { config } from '../../lib/app';
import { isCtrlKey } from '../../utils/utils-platform';


/*
|--------------------------------------------------------------------------
| Header
|--------------------------------------------------------------------------
*/

class Header extends Component {
  static propTypes = {
    playerStatus: PropTypes.string.isRequired,
    repeat: PropTypes.string.isRequired,
    shuffle: PropTypes.bool.isRequired,
    queue: PropTypes.array.isRequired,
    queueCursor: PropTypes.number.isRequired,
    showTopHeader: PropTypes.bool.isRequired,
  }

  constructor(props) {
    super(props);

    this.input = React.createRef();
    this.onKey = this.onKey.bind(this);
  }

  onKey(e) {
    // ctrl-f shortcut
    if (isCtrlKey(e) && e.keyCode === 70) {
      this.input.current.refs.input.select(); // HACKY
    }
  }

  search(e) {
    LibraryActions.search(e.target.value);
  }

  render() {
    const {
      playerStatus, queue, queueCursor, shuffle, repeat, showTopHeader,
    } = this.props;

    return (
      <header>
        {
          showTopHeader && (
            <div className="top-header">
              <WindowControls />
            </div>
          )
        }
        <div className="main-header">
          <div className="col-main-controls">
            <PlayerControls
              playerStatus={playerStatus}
            />
          </div>
          <div className="col-player-infos">
            <PlayingBar
              queue={queue}
              queueCursor={queueCursor}
              shuffle={shuffle}
              repeat={repeat}
            />
          </div>
          <div className="col-search-controls">
            <Input
              selectOnClick
              placeholder="search"
              className="form-control input-sm search"
              changeTimeout={250}
              clearButton
              ref={this.input}
              onChange={this.search}
            />
          </div>
        </div>
        <KeyBinding onKey={this.onKey} preventInputConflict />
      </header>
    );
  }
}

const mapStateToProps = ({ player }) => ({
  playerStatus: player.playerStatus,
  repeat: player.repeat,
  shuffle: player.shuffle,
  queue: player.queue,
  queueCursor: player.queueCursor,
  showTopHeader: os.platform() !== 'darwin' && !config.get('useNativeFrame'),
});

export default connect(mapStateToProps)(Header);
