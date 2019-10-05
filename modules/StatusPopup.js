const { inject } = require('powercord/injector');
const { Toast } = require('powercord/components');
const { React, ReactDOM, getModule } = require('powercord/webpack');
const { createElement, sleep, waitFor, getOwnerInstance } = require('powercord/util');
const { StatusHandler } = require('./../components');

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
            user: res,
            Avatar: this.instances.avatar
          }),
          style: {
            bottom: '25px',
            right: '25px',
            height: 'auto',
            display: 'block',
            padding: '12px'
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
      }

      this.FRIEND_DATA.statusStorage[res.id] = status;
    }
    return res;
  });
};
