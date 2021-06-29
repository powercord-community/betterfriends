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

  for (const module of InjectionIDs.ContextMenu.map(id => id.replace('bf-', ''))) {
    const m = await getModule(m => m.default && m.default.displayName === module);
    inject(`bf-${module}`, m, 'default', (args, res) => {
      let id, getKey, updateKey;

      if (module === 'GroupDMContextMenu') {
        id = args[0].channel.id;
        getKey = 'FAV_DMS';
        updateKey = 'favdms';
      } else {
        id = args[0].user.id;
        if (!isFriend(id)) return res;
        getKey = 'FAV_FRIENDS';
        updateKey = 'favfriends';
      }

      const group = findInReactTree(res, c => Array.isArray(c) && c.find(item => item && item.props && ['block', 'remove-icon'].includes(item.props.id)));
      if (!group) return res;
      if (!this[getKey].includes(id)) {
        group.push(
          React.createElement(MenuItem, {
            id: 'bf-add',
            label: 'Add as Favorite',
            action: () => {
              this[getKey].push(id);
              this.settings.set(updateKey, this[getKey]);
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
              this[getKey] = this[getKey].filter(a => a !== id);
              this.settings.set(updateKey, this[getKey]);
              this.reload();
            }
          })
        );
      }
      
      return res
    });
    m.default.displayName = module;
  }
};
