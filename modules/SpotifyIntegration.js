const { getModule } = require('powercord/webpack');
const { waitFor } = require('powercord/util');
const { inject } = require('powercord/injector');
const { resolve } = require('path');

/*
 * [ Spotify Integration ]
 * Integrates new features into `pc-spotify`
 * Contributors: Bowser65#0001, aetheryx#0001
 */
module.exports = async function () {
  const { getUser } = await getModule([ 'getUser' ]);
  const { getActivities } = await getModule([ 'getActivities' ]);
  const { sync } = await getModule([ 'sync' ]);

  await waitFor('.powercord-spotify');
  this.log('Injecting into pc-spotify context menu (integration with pc-spotify)');

  const isListeningToSpotify = (id) => {
    const activity = getActivities(id);
    const spotify = activity.find(a => a.name === 'Spotify' && a.type === 2);
    if (spotify) {
      return spotify;
    }
    return false;
  };

  const spotifyModule = require.resolve(resolve(`${__dirname}./../../pc-spotify/Modal/contextMenuGroups.js`));

  if (spotifyModule) {
    inject('bf-spotify-integration', require.cache[spotifyModule], 'exports', (args, res) => {
      const spotifyFriends = this.FAV_FRIENDS.filter(c => isListeningToSpotify(c));
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
                onClick: () => sync(isListeningToSpotify(user.id), user.id)
              }))
          } ]
        );
      }
      return res;
    });
  }
};
