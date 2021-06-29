const { inject } = require('powercord/injector');
const { open: openModal } = require('powercord/modal');
const { Icons: { Keyboard }, Tooltip } = require('powercord/components');
const { React, Flux, getModuleByDisplayName, getModule, constants: { Routes } } = require('powercord/webpack');

const FavoriteFriends = require('../components/FavoriteFriends');
const InformationModal = require('../components/InformationModal');

const UNKNOWN_USER = {
  id: '0',
  username: '???',
  isSystemUser: () => false,
  getAvatarURL: () => null,
  isSystemDM: () => false
};

const UNKNOWN_CHANNEL = {
  id: '0',
  name: '???',
  type: 1,
  isMultiUserDM: () => false,
  isSystemUser: () => false,
  isSystemDM: () => false,
  recipients: [ ],
  toString: () => '???'
};

/*
 * [ Friend DM Channel ]
 * Creates and populates the "Favorited Friends" section on the private channel/DMs screen
 */
module.exports = async function () {
  const _this = this;
  const PrivateChannel = await getModuleByDisplayName('PrivateChannel');
  const ConnectedPrivateChannelsList = await getModule(m => m.default && m.default.displayName === 'ConnectedPrivateChannelsList');
  const dms = await getModule([ 'openPrivateChannel' ]);
  const transition = await getModule([ 'transitionTo' ]);
  const userStore = await getModule([ 'getUser', 'getCurrentUser' ]);
  const channelStore = await getModule([ 'getChannel', 'getDMFromUserId' ]);
  const activityStore = await getModule([ 'getPrimaryActivity' ]);
  const statusStore = await getModule([ 'getStatus' ]);
  const classes = {
    ...await getModule([ 'channel', 'closeButton' ]),
    ...await getModule([ 'avatar', 'muted', 'selected' ]),
    ...await getModule([ 'privateChannelsHeaderContainer' ])
  }

  // Patch PrivateChannel
  inject('bf-direct-messages-channel', PrivateChannel.prototype, 'render', function (args, res) {
    if (this.props.isBetterFriends) {
      res.props.children = this.props.infoModal
        ? React.createElement(Tooltip, {
          text: 'User Information',
          position: 'top'
        }, React.createElement(Keyboard, {
          className: 'bf-information',
          onClick: e => {
            e.stopPropagation();
            e.preventDefault();
            const info = _this.FRIEND_DATA.lastMessageID[this.props.user.id];
            openModal(() => React.createElement(InformationModal, {
              user: { ...this.props.user,
                isSystemUser: () => false,
                isSystemDM: () => false
              },
              channel: !info ? 'nothing' : info.channel,
              message: !info ? 'nothing' : info.id
            }));
          }
        }))
        : React.createElement('p');

      if (this.props.channel.id === '0' && res.props.children) {
        res.props.onMouseDown = () => void 0;
        res.props.children = React.createElement('a', null, res.props.children.props.children);
        res.props.onClick = async () => {
          const channelId = await dms.openPrivateChannel(userStore.getCurrentUser().id, this.props.user.id);
          // eslint-disable-next-line new-cap
          transition.transitionTo(Routes.CHANNEL('@me', channelId));
          if (_this.favFriendsInstance) _this.favFriendsInstance.forceUpdate();
        };
      }
    }
    return res;
  });

  // Build connected component
  const ConnectedPrivateChannel = Flux.connectStores(
    [ userStore, channelStore, activityStore, statusStore, powercord.api.settings.store ],
    ({ id, isDM, currentSelectedChannel }) => {
      if (isDM) {
        const channel = channelStore.getChannel(id) ?? UNKNOWN_CHANNEL;
        return {
          user: UNKNOWN_USER,
          channel,
          selected: currentSelectedChannel === id,
          channelName: channel.name,
          isMobile: statusStore.isMobileOnline(id),
          status: statusStore.getStatus(id),
          activities: activityStore.getActivities(id),
        }
      } else {
        const channelId = channelStore.getDMFromUserId(id);
        const user = userStore.getUser(id) || UNKNOWN_USER;

        const channel = channelId
          ? channelStore.getChannel(channelId)
          : UNKNOWN_CHANNEL;

        return {
          user,
          channel,
          selected: currentSelectedChannel === channelId,
          channelName: user.username,
          isMobile: statusStore.isMobileOnline(id),
          status: statusStore.getStatus(id),
          activities: activityStore.getActivities(id),
          infoModal: powercord.api.settings.store.getSetting('betterfriends', 'infomodal'),
          isBetterFriends: true
        };
      }
    }
  )(PrivateChannel);

  // Patch DM list
  inject('bf-direct-messages', ConnectedPrivateChannelsList, 'default', (args, res) => {
    res.props.privateChannelIds = res.props.privateChannelIds
      .filter(c => {
        const channel = channelStore.getChannel(c);
        return !(
          (channel.type === 1 && this.FAV_FRIENDS.includes(channel.recipients[0])) ||
          (channel.type === 3 && this.FAV_DMS.includes(channel.id))
        );
      });

    if (this.favFriendsInstance) this.favFriendsInstance.forceUpdate();
    res.props.children = [
      // Previous elements
      ...res.props.children,
      // Favorite Friends
      () => React.createElement(
        FavoriteFriends,
        { classes, ConnectedPrivateChannel, FAV_FRIENDS: this.FAV_FRIENDS, FAV_DMS: this.FAV_DMS, selectedChannelId: res.props.selectedChannelId, _this }
      )
    ];

    return res;
  });
  ConnectedPrivateChannelsList.default.displayName = 'ConnectedPrivateChannelsList';
};
