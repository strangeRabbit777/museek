import * as electron from 'electron';
import * as React from 'react';

import * as Setting from '../../components/Setting/Setting';
import Dropzone from '../../components/SettingDropzone/SettingDropzone';

import * as LibraryActions from '../../actions/LibraryActions';
import * as PlayerActions from '../../actions/PlayerActions';
import { LibraryState } from '../../reducers/library';

const { dialog } = electron.remote;

interface Props {
  library: LibraryState;
}

export default class SettingsLibrary extends React.Component<Props> {
  onDrop (e: DragEvent) {
    const files = [];

    if (e.dataTransfer) {
      const eventFiles = e.dataTransfer.files;

      for (let i = 0; i < eventFiles.length; i++) {
        files.push(eventFiles[i].path);
      }

      LibraryActions.add(files).catch(err => { console.warn(err); });
    }
  }

  async resetLibrary () {
    PlayerActions.stop();
    await LibraryActions.reset();
  }

  openFolderSelector () {
    dialog.showOpenDialog({
      properties: ['multiSelections', 'openDirectory', 'openFile']
    }, (result) => {
      if (result) {
        LibraryActions.add(result).catch(err => { console.warn(err); });
      }
    });
  }

  render () {
    return (
      <div className='setting settings-musicfolder'>
        <Setting.Section>
          <Dropzone
            title='Add music to library'
            subtitle='Drop files or folders here'
            onDrop={this.onDrop}
            onClick={this.openFolderSelector}
          />
          <button
            title='Fully reset the library'
            disabled={this.props.library.refreshing}
            onClick={this.resetLibrary}
          >
            Reset library
          </button>
        </Setting.Section>
      </div>
    );
  }
}
