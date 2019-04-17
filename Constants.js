const { getModule } = require('powercord/webpack');
const { getRelationships } = getModule([ 'getRelationships' ]);

module.exports = ({
  isFriend: (id) => {
    const relationships = getRelationships();
    return Object.keys(relationships).filter(relation => relationships[relation] === 1).includes(id);
  },
  isFavoriteFriend: (id) => powercord.pluginManager.get('betterfriends').settings.config.favfriends.includes(id),
  Statuses: {
    online: {
      friendly: 'online',
      class: 'online-2S838R'
    },
    idle: {
      friendly: 'idle',
      class: 'idle-3DEnRT'
    },
    dnd: {
      friendly: 'on do not disturb',
      class: 'dnd-1_xrcq'
    },
    offline: {
      friendly: 'offline',
      class: 'offline-3qoTek'
    }
  },
  InjectionIDs: {
    ContextMenu: [ 'bf-contextmenu-listener' ],
    DisplayStar: [ 'bf-star-member', 'bf-star-message' ],
    FavoriteFriendChannel: [ 'bf-direct-messages', 'bf-direct-messages-mount' ],
    FavoriteFriendsSection: [ 'bf-favorite-friends-tabbar' ],
    InformationModal: [ 'bf-message-listener' ],
    StatusPopup: [ 'bf-user' ]
  },
  Sounds: {
    message1: 'Message',
    call_ringing: 'Incoming Call',
    user_join: 'User Joining Voice Channel'
  }
});
