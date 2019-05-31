const { inject } = require('powercord/injector');
const { open: openModal } = require('powercord/modal');
const { getOwnerInstance, waitFor } = require('powercord/util');
const { Icons: { Info }, Tooltip } = require('powercord/components');
const { React, Flux, getModuleByDisplayName, getModule, constants: { Routes } } = require('powercord/webpack');

const InformationModal = require('../components/InformationModal');

/*
 * [ Friend DM Channel ]
 * Creates and populates the "Favorited Friends" section on the private channel/DMs screen
 */
module.exports = async function () {
  const _this = this;
  const PrivateChannel = await getModuleByDisplayName('PrivateChannel');
  const dms = await getModule([ 'openPrivateChannel' ]);
  const transition = await getModule([ 'transitionTo' ]);
  const userStore = await getModule([ 'getUser' ]);
  const channelStore = await getModule([ 'getChannel', 'getDMFromUserId' ]);
  const activityStore = await getModule([ 'getPrimaryActivity' ]);
  const statusStore = await getModule([ 'getStatus' ]);

  // Patch PrivateChannel
  inject('bf-direct-messages-channel', PrivateChannel.prototype, 'render', function (args, res) {
    if (this.props.isBetterFriends) {
      res.props.children.props.children[2] = this.props.infoModal
        ? React.createElement(Tooltip, {
          text: 'User Information',
          position: 'top'
        }, React.createElement(Info, {
          className: 'bf-information',
          onClick: e => {
            e.stopPropagation();
            e.preventDefault();
            const info = _this.FRIEND_DATA.lastMessageID[this.props.user.id];
            openModal(() => React.createElement(InformationModal, {
              user: this.props.user,
              channel: !info ? 'nothing' : info.channel,
              message: !info ? 'nothing' : info.id
            }));
          }
        }))
        : null;

      if (this.props.channel.id === '0') {
        res.props.onMouseDown = () => void 0;
        res.props.children = React.createElement('a', null, res.props.children.props.children);
        res.props.onClick = async () => {
          const channelId = await dms.openPrivateChannel(userStore.getCurrentUser().id, this.props.user.id);
          // eslint-disable-next-line new-cap
          transition.transitionTo(Routes.CHANNEL('@me', channelId));
        };
      }
    }
    return res;
  });

  // Build connected component
  const ConnectedPrivateChannel = Flux.connectStores(
    [ userStore, channelStore, activityStore, statusStore, powercord.api.settings.store ],
    ({ userId }) => {
      const channelId = channelStore.getDMFromUserId(userId);
      const user = userStore.getUser(userId);
      const channel = channelId
        ? channelStore.getChannel(channelId)
        : {
          id: '0',
          type: 1,
          toString: () => user.username
        };

      return {
        user,
        channel,
        status: statusStore.getStatus(userId),
        activity: activityStore.getPrimaryActivity(userId),
        infoModal: powercord.api.settings.store.getSetting('betterfriends', 'infomodal'),
        isBetterFriends: true
      };
    }
  )(PrivateChannel);

  // Patch DM list
  const PrivateChannelsList = getOwnerInstance(await waitFor('.pc-privateChannels'))._reactInternalFiber.return.return.child.child.child.child.memoizedProps.children[1].type;
  const ConnectedFavouriteFriends = this.settings.connectStore(({ getSetting, toggleSetting }) => [
    React.createElement('header', {
      className: `bf-ff-header${!getSetting('collapseInDMs', false) ? ' opened' : ''}`,
      onClick: () => toggleSetting('collapseInDMs')
    }, [
      React.createElement('svg', {
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: '0 0 24 24'
      }, React.createElement('path', {
        fill: '#fff',
        d: 'M9.29 15.88L13.17 12 9.29 8.12c-.39-.39-.39-1.02 0-1.41.39-.39 1.02-.39 1.41 0l4.59 4.59c.39.39.39 1.02 0 1.41L10.7 17.3c-.39.39-1.02.39-1.41 0-.38-.39-.39-1.03 0-1.42z'
      })),
      React.createElement('span', null, 'Favourite Friends')
    ]),
    !_this.settings.get('collapseInDMs', false) && this.FAV_FRIENDS.map(userId => React.createElement(ConnectedPrivateChannel, { userId }))
  ]);

  inject('bf-direct-messages', PrivateChannelsList.prototype, 'render', (args, res) => {
    res.props.children = [
      res.props.children.slice(0, res.props.children.length - 1),
      this.FAV_FRIENDS.length > 0 && React.createElement(ConnectedFavouriteFriends),
      res.props.children.slice(res.props.children.length - 1)
    ];
    return res;
  });
};
