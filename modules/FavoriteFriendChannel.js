const { inject } = require('powercord/injector');
const { React, getModule } = require('powercord/webpack');
const { waitFor, getOwnerInstance } = require('powercord/util');
const { FriendChannel } = require('./../components');

/*
 * [ Friend DM Channel ]
 * Creates and populates the "Favorited Friends" section on the private channel/DMs screen
 */
module.exports = async function () {
  const { getStatus } = await getModule([ 'getStatus' ]);
  const getUser = await getModule([ 'getUser' ]);

  if (!document.querySelector('.pc-privateChannels')) {
    await waitFor('.pc-privateChannels');
  }
  const DIRECT_MESSAGES_HEADER = [ ...document.querySelectorAll('header') ].find(a => a.innerHTML === 'Direct Messages');
  DIRECT_MESSAGES_HEADER.parentNode.classList.add('bf-friends-scroller');
  const original = document.querySelector('.pc-privateChannels .pc-scrollerWrap .pc-scroller');
  const injector = [ ...original.querySelectorAll('a') ].find(el => el.href === 'https://canary.discordapp.com/channels/@me').parentElement;

  const updateInstance = () =>
    (this.statusPopupInstance = getOwnerInstance(injector));
  const instancePrototype = Object.getPrototypeOf(updateInstance());
  updateInstance();


  inject('bf-friendslist', instancePrototype, 'render', (args, res) => {
    // const exists = [ ...document.querySelectorAll('header') ].find(a => a.innerHTML === 'Favorite Friends');
    const friends = [];
    for (const id of this.FAV_FRIENDS) {
      const friend = getUser.getUser(id);
      if (!this.FRIEND_DATA.statusStorage[friend.id]) {
        this.FRIEND_DATA.statusStorage[friend.id] = getStatus(friend.id);
      }
      friends.push(React.createElement(FriendChannel, {
        user: friend,
        status: this.FRIEND_DATA.statusStorage[friend.id] || 'offline',
        data: this
      }));
    }

    const FAV_FRIENDS_HEADER = React.createElement('header', { children: 'Favorite Friends' });
    if (res.props.children.props.to.pathname === '/channels/@me') {
      return [ res, FAV_FRIENDS_HEADER, ...friends ];
    }
    return res;
  });
};
