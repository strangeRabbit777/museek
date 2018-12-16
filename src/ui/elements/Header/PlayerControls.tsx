import * as React from 'react';
import * as Icon from 'react-fontawesome';
import VolumeControl from './VolumeControl';

import * as PlayerActions from '../../actions/PlayerActions';
import { PlayerStatus } from '../../../shared/types/interfaces';

/*
|--------------------------------------------------------------------------
| PlayerControls
|--------------------------------------------------------------------------
*/

interface Props {
  playerStatus: PlayerStatus;
}

export default class PlayerControls extends React.PureComponent<Props> {
  render () {
    return (
      <div className='player-controls'>
        <button
          type='button'
          className='player-control previous'
          title='Previous'
          onClick={PlayerActions.previous}
        >
          <Icon name='backward' />
        </button>
        <button
          className='player-control play'
          title={this.props.playerStatus === PlayerStatus.PLAY ? 'Pause' : 'Play'}
          onClick={PlayerActions.playPause}
        >
          <Icon name={this.props.playerStatus === PlayerStatus.PLAY ? 'pause' : 'play'} fixedWidth />
        </button>
        <button
          type='button'
          className='player-control forward'
          title='Next'
          onClick={PlayerActions.next}
        >
          <Icon name='forward' />
        </button>
        <VolumeControl />
      </div>
    );
  }
}
