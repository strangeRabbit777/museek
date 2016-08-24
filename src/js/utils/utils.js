/*
|--------------------------------------------------------------------------
| Utils
|--------------------------------------------------------------------------
*/

import path from 'path';
import fs   from 'fs';

import mmd     from 'musicmetadata';
import wavInfo from 'wav-file-info';


const utils = {

    /**
     * Parse an int to a more readable string
     *
     * @param int duration
     * @return string
     */
    parseDuration: function (duration) {

        if(duration !== null && duration !== undefined) {

            let hours   = parseInt(duration / 3600);
            let minutes = parseInt(duration / 60) % 60;
            let seconds = parseInt(duration % 60);

            hours = hours < 10 ? `0${hours}` : hours;
            minutes = minutes < 10 ? `0${minutes}` : minutes;
            seconds = seconds < 10 ? `0${seconds}` : seconds;
            let result = hours > 0 ? `${hours}:` : '';
            result += `${minutes}:${seconds}`;

            return result;

        }

        return '00:00';
    },

    /**
     * Format a list of tracks to a nice status
     *
     * @param array tracks
     * @return string
     */
    getStatus: function(tracks) {
        const status = this.parseDuration(tracks.length === 0 ? 0 : tracks.map((d) => d.duration).reduce((a, b) => a + b));
        return `${tracks.length} tracks, ${status}`;
    },

    /**
     * Parse an URI, encoding some caracters
     *
     * @param string uri
     * @return string
     */
    parseUri: function(uri) {
        const root = process.platform === 'win32' ? '' : path.parse(uri).root;
        const location = uri
            .split(path.sep)
            .map((d, i) => {
                return i === 0 ? d : encodeURIComponent(d);
            })
            .reduce((a, b) => path.join(a, b));
        return `file://${root}${location}`;
    },

    /**
     * Parse data to be used by img/background-image with base64
     *
     * @param string format of the image
     * @param string data base64 string
     * @return string
     */
    parseBase64: function(format, data) {

        return `data:image/${format};base64,${data}`;
    },

    /**
     * Sort an array of int by ASC or DESC, then remove all duplicates
     *
     * @param array  array of int to be sorted
     * @param string 'asc' or 'desc' depending of the sort needed
     * @return array
     */
    simpleSort: function(array, sorting) {

        if(sorting === 'asc') {
            array.sort((a, b) => {
                return a - b;
            });
        } else if (sorting === 'desc') {
            array.sort((a, b) => {
                return b - a;
            });
        }


        const result = [];
        array.forEach((item) => {
            if(!result.includes(item)) result.push(item);
        });

        return result;
    },

    /**
     * Strip accent from String. From https://jsperf.com/strip-accents
     *
     * @param String str
     * @return String
     */
    stripAccents(str) {

        const accents = 'ÀÁÂÃÄÅàáâãäåÒÓÔÕÕÖØòóôõöøÈÉÊËèéêëðÇçÐÌÍÎÏìíîïÙÚÛÜùúûüÑñŠšŸÿýŽž',
            fixes = 'AAAAAAaaaaaaOOOOOOOooooooEEEEeeeeeCcDIIIIiiiiUUUUuuuuNnSsYyyZz',
            split = accents.split('').join('|'),
            reg = new RegExp(`(${split})`, 'g');

        function replacement(a) {
            return fixes[accents.indexOf(a)] || '';
        }

        return str.replace(reg, replacement).toLowerCase();
    },

    /**
     * Remove duplicates (realpath) and useless children folders
     *
     * @param array the array of folders path
     * @return array
     */
    removeUselessFolders: function(folders) {

        // Remove duplicates
        let filteredFolders = folders.filter((elem, index) => {
            return folders.indexOf(elem) === index;
        });

        const foldersToBeRemoved = [];

        filteredFolders.forEach((folder, i) => {
            filteredFolders.forEach((subfolder, j) => {
                if(subfolder.includes(folder) && i !== j && !foldersToBeRemoved.includes(folder)) foldersToBeRemoved.push(subfolder);
            });
        });

        filteredFolders = filteredFolders.filter((elem) => {
            return !foldersToBeRemoved.includes(elem);
        });

        return filteredFolders;
    },

    /**
     * Cut an array in smaller chunks
     *
     * @param array the array to be chunked
     * @param int the length of each chunk
     * @return array
     */
    chunkArray: function(array, chunkLength) {

        const chunks = [];

        for(let i = 0, length = array.length; i < length; i += chunkLength) {
            chunks.push(array.slice(i, i + chunkLength));
        }

        return chunks;
    },

    /**
     * Get a file metadata
     *
     * @param path (string)
     * @return object
     *
     */
    getMetadata: function(track, callback) {

        /* output should be something like this:
            {
                album        : null,
                albumartist  : null,
                artist       : null,
                disk         : null,
                duration     : null,
                genre        : null,
                loweredMetas : null,
                path         : null,
                playCount    : null,
                title        : null,
                track        : null,
                type         : null,
                year         : null
            }
        */

        if(path.extname(track) === '.wav') { // If WAV

            wavInfo.infoByFilename(track, (err, info) => {

                if (err) console.warn(err);

                const metadata = {
                    album        : 'Unknown',
                    albumartist  : [],
                    artist       : ['Unknown artist'],
                    cover        : null,
                    disk         : {
                        no: 0,
                        of: 0
                    },
                    duration     : info.duration,
                    genre        : [],
                    loweredMetas : {},
                    path         : track,
                    playCount    : 0,
                    title        : path.parse(track).base,
                    track        : {
                        no: 0,
                        of: 0
                    },
                    type         : 'track',
                    year         : ''
                };

                metadata.loweredMetas = {
                    artist      : metadata.artist.map((meta) => utils.stripAccents(meta.toLowerCase())),
                    album       : utils.stripAccents(metadata.album.toLowerCase()),
                    albumartist : metadata.albumartist.map((meta) => utils.stripAccents(meta.toLowerCase())),
                    title       : utils.stripAccents(metadata.title.toLowerCase()),
                    genre       : metadata.genre.map((meta) => utils.stripAccents(meta.toLowerCase()))
                };

                callback(metadata);
            });

        } else {

            const stream = fs.createReadStream(track);

            mmd(stream, { duration: true }, (err, data) => {

                if(err) console.warn(`An error occured while reading ${track} id3 tags: ${err}`);

                const metadata = {
                    album        : data.album === null || data.album === '' ? 'Unknown' : data.album,
                    albumartist  : data.albumartist,
                    artist       : data.artist.length === 0 ? ['Unknown artist'] : data.artist,
                    cover        : data.picture[0] ? { format: data.picture[0].format, data: data.picture[0].data.toString('base64') } : null,
                    disk         : data.disk,
                    duration     : data.duration === '' ? 0 : data.duration,
                    genre        : data.genre,
                    loweredMetas : {},
                    path         : track,
                    playCount    : 0,
                    title        : data.title === null || data.title === '' ? path.parse(track).base : data.title,
                    track        : data.track,
                    type         : 'track',
                    year         : data.year
                };

                metadata.loweredMetas = {
                    artist      : metadata.artist.map((meta) => utils.stripAccents(meta.toLowerCase())),
                    album       : utils.stripAccents(metadata.album.toLowerCase()),
                    albumartist : metadata.albumartist.map((meta) => utils.stripAccents(meta.toLowerCase())),
                    title       : utils.stripAccents(metadata.title.toLowerCase()),
                    genre       : metadata.genre.map((meta) => utils.stripAccents(meta.toLowerCase()))
                };

                callback(metadata);
            });
        }
    }
};

export default utils;
