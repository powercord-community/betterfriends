const { inject } = require('powercord/injector');
const { open: openModal } = require('powercord/modal');
const { Icons: { Keyboard }, Tooltip } = require('powercord/components');
const { React, Flux, getModuleByDisplayName, getModule, constants: { Routes } } = require('powercord/webpack');

const FavoriteFriends = require('../components/FavoriteFriends');
const InformationModal = require('../components/InformationModal');

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
    ({ userId, currentSelectedChannel }) => {
      const channelId = channelStore.getDMFromUserId(userId);
      const selected = currentSelectedChannel === channelId;
      const user = userStore.getUser(userId) || { id: '0',
        username: '???',
        isSystemUser: () => false,
        getAvatarURL: () => null,
        isSystemDM: () => false
      };

      const channel = channelId
        ? channelStore.getChannel(channelId)
        : {
          id: '0',
          type: 1,
          isMultiUserDM: () => false,
          isSystemUser: () => false,
          isSystemDM: () => false,
          recipients: [ user.id ],
          toString: () => user.username
        };

      return {
        user,
        channel,
        selected,
        channelName: user.username,
        isMobile: statusStore.isMobileOnline(userId),
        status: statusStore.getStatus(userId),
        activities: activityStore.getActivities(userId),
        infoModal: powercord.api.settings.store.getSetting('betterfriends', 'infomodal'),
        isBetterFriends: true
      };
    }
  )(PrivateChannel);

  // Patch DM list
  inject('bf-direct-messages', ConnectedPrivateChannelsList, 'default', (args, res) => {
    res.props.privateChannelIds = res.props.privateChannelIds
      .filter(c => {
        const channel = channelStore.getChannel(c);
        return channel.type !== 1 || !this.FAV_FRIENDS.includes(channel.recipients[0]);
      });

    if (this.favFriendsInstance) this.favFriendsInstance.forceUpdate();
    res.props.children = [
      // Previous elements
      ...res.props.children,
      // Favorite Friends
      () => React.createElement(
        FavoriteFriends,
        { classes, ConnectedPrivateChannel, FAV_FRIENDS: this.FAV_FRIENDS, selectedChannelId: res.props.selectedChannelId, _this }
      )
    ];

    return res;
  });
  ConnectedPrivateChannelsList.default.displayName = 'ConnectedPrivateChannelsList';
};
