const { React } = require('powercord/webpack');
const { getModule } = require('powercord/webpack');
const { inject } = require('powercord/injector');
const { findInReactTree } = require('powercord/util');

const { InjectionIDs } = require('../Constants');

/*
 * [ Context Menu ]
 * Handles the creation of new buttons in context menus relating to favorite friends
 * Contributors: Joakim#9814, Bowser65#0001, Juby210#0577
 */
module.exports = async function () {
  const { MenuItem } = await getModule([ 'MenuGroup', 'MenuItem' ]);
  const { getRelationships } = await getModule([ 'getRelationships' ]);
  const isFriend = (id) => {
    const relationships = getRelationships();
    return Object.keys(relationships).filter(relation => relationships[relation] === 1).includes(id);
  };
  const isFavoriteFriend = (id) => this.FAV_FRIENDS.includes(id);
  for (const module of InjectionIDs.ContextMenu.map(id => id.replace('bf-', ''))) {
    const m = await getModule(m => m.default && m.default.displayName === module);
    inject(`bf-${module}`, m, 'default', (args, res) => {
      console.log(args, res);
      const { id } = args[0].user;
      if (isFriend(id)) {
        const group = findInReactTree(res, c => Array.isArray(c) && c.find(item => item && item.props && item.props.id === 'block'));
        if (!group) return res;
        if (!isFavoriteFriend(id)) {
          group.push(
            React.createElement(MenuItem, {
              id: 'bf-add',
              label: 'Add as Favorite',
              action: () => {
                this.FAV_FRIENDS.push(id);
                this.settings.set('favfriends', this.FAV_FRIENDS);
                this.reload();
              }
            })
          );
        } else {
          group.push(
            React.createElement(MenuItem, {
              id: 'bf-remove',
              label: 'Remove from Favorites',
              action: () => {
                this.FAV_FRIENDS = this.FAV_FRIENDS.filter(a => a !== id);
                this.settings.set('favfriends', this.FAV_FRIENDS);
                this.reload();
              }
            })
          );
        }
      }
      return res
    });
    m.default.displayName = module;
  }
};
