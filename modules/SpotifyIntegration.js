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
  const { getPrimaryActivity } = await getModule([ 'getPrimaryActivity' ]);
  const { sync } = await getModule([ 'sync', 'stopSyncing' ]);

  await waitFor('.powercord-spotify');
  this.log('Injecting into pc-spotify context menu (integration with pc-spotify)');

  const isListeningToSpotify = (id) => {
    const activity = getPrimaryActivity(id);
    if (activity && activity.name === 'Spotify') {
      return true;
    }
    return false;
  };

  const spotifyModule = require.resolve(resolve(`${__dirname}./../../pc-spotify/Modal/contextMenuGroups.js`));
  if (spotifyModule) {
    inject('bf-spotify-integration', require.cache[spotifyModule], 'exports', (args, res) => {
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
                onClick: () => sync(getPrimaryActivity(user.id), user.id)
              }))
          } ]
        );
      }
      return res;
    });
  }
};
