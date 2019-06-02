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
  const { lastMessageId } = await getModule([ 'lastMessageId' ]);
  const { getDMFromUserId } = await getModule([ 'getDMFromUserId' ]);

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
  inject('bf-direct-messages', PrivateChannelsList.prototype, 'render', (args, res) => {
    res.props.children = [
      // Previous elements
      res.props.children.slice(0, res.props.children.length - 1),
      // Header
      this.FAV_FRIENDS.length > 0 && React.createElement('header', null, 'Favorite Friends'),
      // Friends
      this.FAV_FRIENDS.map(userId => React.createElement(ConnectedPrivateChannel, { userId })),
      // Previous elements
      res.props.children.slice(res.props.children.length - 1)
    ];
    this.FAV_FRIENDS.sort((a, b) => lastMessageId(getDMFromUserId(b)) - lastMessageId(getDMFromUserId(a)));
    res.props.privateChannelIds = res.props.privateChannelIds
      .filter(c => {
        const channel = channelStore.getChannel(c);
        return channel.type !== 1 || !this.FAV_FRIENDS.includes(channel.recipients[0]);
      });

    return res;
  });
};
