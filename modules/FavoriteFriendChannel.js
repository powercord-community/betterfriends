const { inject } = require('powercord/injector');
const { open: openModal } = require('powercord/modal');
const { getOwnerInstance, waitFor, forceUpdateElement } = require('powercord/util');
const { Icons: { Info }, Tooltip } = require('powercord/components');
const { React, Flux, getModuleByDisplayName, getModule, constants: { Routes } } = require('powercord/webpack');

const InformationModal = require('../components/InformationModal');

/*
 * [ Friend DM Channel ]
 * Creates and populates the "Favorited Friends" section on the private channel/DMs screen
 */
module.exports = async function () {
  this.expanded = true;
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
      res.props.children = this.props.infoModal
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
          forceUpdateElement('.privateChannels-1nO12o');
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
      const user = userStore.getUser(userId) || { id: '0',
        username: '???',
        getAvatarURL: () => null };

      const channel = channelId
        ? channelStore.getChannel(channelId)
        : {
          id: '0',
          type: 1,
          isMultiUserDM: () => false,
          recipients: [ user.id ],
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
  const ownerInstance = getOwnerInstance(await waitFor('.privateChannels-1nO12o'));
  const PrivateChannelsList = ownerInstance._reactInternalFiber.return.return.child.child.child.child.memoizedProps.children[1].type;

  inject('bf-direct-messages', PrivateChannelsList.prototype, 'render', (args, res) => {
    res.props.privateChannelIds = res.props.privateChannelIds
      .filter(c => {
        const channel = channelStore.getChannel(c);
        return channel.type !== 1 || !this.FAV_FRIENDS.includes(channel.recipients[0]);
      });

    res.props.children = [
      // Previous elements
      res.props.children.slice(0, res.props.children.length - 1),
      // Header
      this.FAV_FRIENDS.length > 0 && React.createElement('header', { className: 'bf-fav-friends-header header-zu8eWb container-2ax-kl' },
        [ 'Favorite Friends',
          React.createElement('svg', {
            className: `bf-expand-fav-friends ${this.expanded ? 'expanded' : 'collapsed'}`,
            height: 15,
            width: 20,
            viewBox: '0 0 20 20',
            onClick: () => {
              this.expanded = !this.expanded;
              forceUpdateElement('.privateChannels-1nO12o');
            }
          }, React.createElement('path', {
            fill: 'rgb(142, 146, 151)',
            d: 'M4.516 7.548c0.436-0.446 1.043-0.481 1.576 0l3.908 3.747 3.908-3.747c0.533-0.481 1.141-0.446 1.574 0 0.436 0.445 0.408 1.197 0 1.615-0.406 0.418-4.695 4.502-4.695 4.502-0.217 0.223-0.502 0.335-0.787 0.335s-0.57-0.112-0.789-0.335c0 0-4.287-4.084-4.695-4.502s-0.436-1.17 0-1.615z'
          })
          ) ]
      ),
      // Friends
      this.expanded
        ? this.FAV_FRIENDS
          .sort((a, b) => lastMessageId(getDMFromUserId(b)) - lastMessageId(getDMFromUserId(a)))
          .map(userId => React.createElement(ConnectedPrivateChannel, { userId }))
        : null,
      // Previous elements
      res.props.children.slice(res.props.children.length - 1)
    ];

    return res;
  });

  forceUpdateElement('.privateChannels-1nO12o');
};
