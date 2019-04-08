const { React } = require('powercord/webpack');
const { getModuleByDisplayName } = require('powercord/webpack');
const { inject } = require('powercord/injector');
const { ContextMenu: { Button } } = require('powercord/components');
const { isFriend, isFavoriteFriend } = require('./../Constants');

/*
 * [ Context Menu ]
 * Handles the creation of new buttons in context menus relating to favorite friends
 * Contributors: Joakim#9814, Bowser65#0001
 */
module.exports = async function () {
  const UserContextMenu = getModuleByDisplayName('UserContextMenu');
  inject('bf-contextmenu-listener', UserContextMenu.prototype, 'render', (args, res) => {
    this.log(res);
    const id = res.props.children.props.children.props.children[0].props.children[0].props.userId;
    if (isFriend(id)) {
      if (!isFavoriteFriend(id)) {
        res.props.children.props.children.props.children[1].props.children.splice(4, 0,
          React.createElement(Button, {
            name: 'Add as Favorite',
            onClick: () => {
              this.FAV_FRIENDS.push(id);
              this.settings.set('favfriends', this.FAV_FRIENDS);
              this.reload('FavoriteFriendChannel', 'FavoriteFriendsSection');
            }
          })
        );
      } else {
        res.props.children.props.children.props.children[1].props.children.splice(4, 0,
          React.createElement(Button, {
            name: 'Remove from Favorites',
            onClick: () => {
              this.FAV_FRIENDS = this.FAV_FRIENDS.filter(a => a !== id);
              this.settings.set('favfriends', this.FAV_FRIENDS);
              this.reload('FavoriteFriendChannel', 'FavoriteFriendsSection');
            }
          })
        );
      }
    }
    return res;
  });
};
