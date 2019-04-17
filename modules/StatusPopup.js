const { inject } = require('powercord/injector');
const { Toast } = require('powercord/components');
const { React, ReactDOM, getModule } = require('powercord/webpack');
const { createElement, sleep } = require('powercord/util');
const { StatusHandler } = require('./../components');

const statuses = {
  online: { friendly: 'online',
    class: 'online-2S838R' },
  idle: { friendly: 'idle',
    class: 'idle-3DEnRT' },
  dnd: { friendly: 'on do not disturb',
    class: 'dnd-1_xrcq' },
  offline: { friendly: 'offline',
    class: 'offline-3qoTek' }
};

/*
 * [ Status Popup ]
 * Listens for status changes from favorited friends, stores them and displays a little notification.
 * Contributors: aetheryx#0001
 */
module.exports = async function () {
  if (!this.settings.config.statuspopup) {
    return;
  }
  const { getStatus } = await getModule([ 'getStatus' ]);
  const { getDMFromUserId } = await getModule([ 'getDMFromUserId' ]);
  const getUser = await getModule([ 'getUser' ]);

  inject('bf-user', getUser, 'getUser', (args, res) => {
    if (res && this.FAV_FRIENDS.includes(res.id)) {
      const status = getStatus(res.id);
      const previous = this.FRIEND_DATA.statusStorage[res.id];
      if (previous && status !== previous) {
        this.log('Showing notification');
        const container = createElement('div', { id: 'bf-friend-status-popup' });
        document.body.appendChild(container);
        const Notification = React.createElement(Toast, {
          header: React.createElement(StatusHandler, {
            status,
            user: res
          }),
          style: {
            bottom: '25px',
            right: '25px',
            height: 'auto',
            display: 'block',
            padding: '20px'
          },
          buttons: []
        });
        // this.statusPopupInstance.forceUpdate();
        const render = async () => {
          const NotificationRenderer = ReactDOM.render(Notification, container);
          if (Notification && NotificationRenderer) {
            await sleep(3500);
            NotificationRenderer.setState({ leaving: true });
            await sleep(500);
          }
          container.remove();
        };
        render();

        for (const friend of [ ...document.querySelectorAll('.channel-2QD9_O') ]) {
          if (friend.firstChild.href.includes(getDMFromUserId(res.id))) {
            const statusDiv = friend.querySelector('.pc-status');
            statusDiv.classList.remove(statuses[previous].class);
            statusDiv.classList.add(statuses[status].class);
          }
        }
      }

      this.FRIEND_DATA.statusStorage[res.id] = status;
    }
    return res;
  });
};
