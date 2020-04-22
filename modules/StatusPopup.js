const { inject } = require('powercord/injector');
const Toast = require('./../../pc-notices/components/Toast');
const { React, ReactDOM, getModule } = require('powercord/webpack');
const { createElement, sleep, waitFor, getOwnerInstance } = require('powercord/util');
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
  if (!this.settings.get('statuspopup')) {
    return;
  }
  const avatarElement = await waitFor('.avatar-3uk_u9 > .wrapper-3t9DeA');
  const Avatar = getOwnerInstance(avatarElement);
  this.instances.avatar = Avatar._reactInternalFiber.child.child.child.child.child.return.child.type;
  const { getStatus } = await getModule([ 'getStatus' ]);
  const getUser = await getModule([ 'getUser', 'getCurrentUser' ]);

  inject('bf-user', getUser, 'getUser', (args, res) => {
    if (res && this.FAV_FRIENDS.includes(res.id)) {
      const status = getStatus(res.id);
      const previous = this.FRIEND_DATA.statusStorage[res.id];
      if (previous && status !== previous) {
        this.log('Showing notification');
        powercord.api.notices.sendToast(`bf-friend-notification-${Math.random() * 100}`, {
          icon: false,
          header: `Friend ${FRIENDLY_STATEMENT[status]}`,
          content: React.createElement(StatusHandler, {
            status,
            user: res,
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

      this.FRIEND_DATA.statusStorage[res.id] = status;
    }
    return res;
  });
};
