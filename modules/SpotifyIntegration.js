const { getModule } = require('powercord/webpack');
const { waitFor } = require('powercord/util');
const { inject } = require('powercord/injector');
const { getUser } = getModule([ 'getUser' ]);
const { getPrimaryActivity } = getModule([ 'getPrimaryActivity' ]);
const { sync } = getModule([ 'sync', 'stopSyncing' ]);
const SpotifyPlayer = require('./../../pc-spotify/SpotifyPlayer');
const { resolve } = require('path');

/*
 * [ Spotify Integration ]
 * Integrates new features into `pc-spotify`
 * Contributors: Bowser65#0001
 */
module.exports = async function () {
  await waitFor('.powercord-spotify');
  this.log('Injecting into pc-spotify context menu (integration with pc-spotify)');
  const onButtonClick = (method, ...args) => SpotifyPlayer[method](...args)
    .then(() => true);

  const isListeningToSpotify = (id) => {
    const activity = getPrimaryActivity(id);
    this.log(activity);
    if (activity && activity.name === 'Spotify') {
      return true;
    }
    return false;
  };

  inject('bf-spotify-integration', require.cache[require.resolve(resolve(`${__dirname}./../../pc-spotify/Modal/contextMenuGroups.js`))], 'exports', (args, res) => {
    const spotifyFriends = this.FAV_FRIENDS.filter(isListeningToSpotify);
    if (spotifyFriends.length) {
      res.unshift(
        [ {
          type: 'submenu',
          name: 'Friends',
          width: '200px',
          getItems: () => spotifyFriends.map(fr => getUser(fr))
            .map(user => ({
              type: 'button',
              name: user.username,
              hint: '🎧',
              onClick: () => onButtonClick('play', {
                context_uri: sync(getPrimaryActivity(user.id), '246574843460321291')
              })
            }))
        } ]
      );
    }
    return res;
  });
};
