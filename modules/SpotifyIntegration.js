const { getModule, React } = require('powercord/webpack');
const { waitFor } = require('powercord/util');
const { inject, uninject } = require('powercord/injector');
const { resolve } = require('path');

/*
 * [ Spotify Integration ]
 * Integrates new features into `pc-spotify`
 * Contributors: Bowser65#0001, aetheryx#0001, Juby210#0577
 */
module.exports = async function () {
  const { getUser } = await getModule([ 'getUser', 'getUsers' ]);
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

  const { MenuItem } = await getModule([ 'MenuGroup', 'MenuItem' ])
  const spotifyModule = require.resolve(resolve(`${__dirname}./../../pc-spotify/components/ContextMenu.jsx`));

  if (spotifyModule) {
    inject('bf-spotify-integration2', require.cache[spotifyModule].exports.prototype, 'render', (args, res) => {
      inject('bf-spotify-integration', res.type.prototype, 'render', (args, res) => {
        const isPremium = getModule([ 'isSpotifyPremium' ], false).isSpotifyPremium();
        if (!isPremium) return res;

        const spotifyFriends = this.FAV_FRIENDS.filter(c => isListeningToSpotify(c));
        if (spotifyFriends.length && res.props.children[1] && res.props.children[1].props.children) {
          res.props.children[1].props.children.unshift(React.createElement(
            MenuItem,
            {
              id: 'bf-spotify',
              label: 'Friends'
            },
            spotifyFriends.map(fr => getUser(fr))
              .map(user => React.createElement(MenuItem, {
                id: `bf-spotify-${user.id}`,
                label: user.username,
                hint: '🎧',
                action: () => sync(isListeningToSpotify(user.id), user.id)
              }))
          ));
        }
        return res;
      });
      uninject('bf-spotify-integration2');
      return res;
    });
  }
};
