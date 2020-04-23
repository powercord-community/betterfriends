const { inject } = require('powercord/injector');
const { React, getModule } = require('powercord/webpack');
const { waitFor, getOwnerInstance } = require('powercord/util');
const { StatusHandler } = require('./../components');

const FRIENDLY_STATEMENT = {
  online: 'went online',
  offline: 'went offline',
  dnd: 'went in to do not disturb',
  idle: 'went idle'
}

/*
 * [ Status Popup ]
 * Listens for status changes from favorited friends, stores them and displays a little notification.
 * Contributors: aetheryx#0001
 */
module.exports = async function () {
  if (!this.settings.get('statuspopup', true)) return;
  const classes = {
    ...await getModule([ 'avatar', 'wrapper' ]),
    ...await getModule([ 'avatar', 'muted', 'selected' ])
  }
  const avatarElement = await waitFor(`.${classes.avatar} > .${classes.wrapper}`);
  const Avatar = getOwnerInstance(avatarElement);
  // it can be better i think
  this.instances.avatar = Avatar._reactInternalFiber.child.child.child.child.child.return.child.type;
  if (this.instances.avatar === 'a') this.instances.avatar = Avatar._reactInternalFiber.child.return.child.child.child.child.child.child.child.child.child.type;
  this.createFriendPopup = (user, status) => {
    powercord.api.notices.sendToast(`bf-friend-notification-${Math.random() * 100}`, {
      icon: false,
      className: 'bf-status-popup',
      hideProgressBar: true,
      header: `Friend ${FRIENDLY_STATEMENT[status]}`,
      content: React.createElement(StatusHandler, {
        status,
        user,
        Avatar: this.instances.avatar
      }),
      timeout: 5000,
      style: {
        bottom: '25px',
        right: '25px',
        height: 'auto',
        display: 'block',
        padding: '12px'
      },
      buttons: []
    });
  }

  const { getStatus } = await getModule([ 'getStatus' ]);
  const getUser = await getModule([ 'getUser', 'getCurrentUser' ]);

  inject('bf-user', getUser, 'getUser', (args, res) => {
    if (res && this.FAV_FRIENDS.includes(res.id)) {
      const status = getStatus(res.id);
      const previous = this.FRIEND_DATA.statusStorage[res.id];
      if (previous && status !== previous) {
        this.log('Showing notification');
        this.createFriendPopup(res, status)
      }

      this.FRIEND_DATA.statusStorage[res.id] = status;
    }
    return res;
  });
};
