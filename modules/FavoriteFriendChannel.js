const { inject } = require('powercord/injector');
const { open: openModal } = require('powercord/modal');
const { forceUpdateElement, sleep } = require('powercord/util');
const { Icons: { Keyboard }, Tooltip } = require('powercord/components');
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
  const ConnectedPrivateChannelsList = await getModule(m => m.default && m.default.displayName === 'ConnectedPrivateChannelsList');
  const dms = await getModule([ 'openPrivateChannel' ]);
  const transition = await getModule([ 'transitionTo' ]);
  const userStore = await getModule([ 'getUser', 'getCurrentUser' ]);
  const channelStore = await getModule([ 'getChannel', 'getDMFromUserId' ]);
  const activityStore = await getModule([ 'getPrimaryActivity' ]);
  const statusStore = await getModule([ 'getStatus' ]);
  const { lastMessageId } = await getModule([ 'lastMessageId' ]);
  const { getDMFromUserId } = await getModule([ 'getDMFromUserId' ]);
  const classes = {
    ...await getModule([ 'privateChannels' ]),
    ...await getModule([ 'channel', 'closeButton' ]),
    ...await getModule([ 'avatar', 'muted', 'selected' ]),
    ...await getModule([ 'privateChannelsHeaderContainer' ])
  }

  this.clickListener = (event) => {
    let el = event.target;
    const setElement = () => {
      do {
        if (el.matches('.' + classes.channel)) {
          for (const elm of [ ...document.querySelectorAll('.' + classes.selected) ]) {
            elm.classList.remove(classes.selected);
          }
          return el;
        }
        el = el.parentElement || el.parentNode;
      } while (el !== null && el.nodeType === 1);
    };
    setElement();

    if (el && el.classList && !el.classList.contains(classes.selected)) {
      el.classList.add(classes.selected);
    }
  };

  document.addEventListener('click', this.clickListener);

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
          forceUpdateElement('.' + classes.privateChannels);
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

    res.props.children = [
      // Previous elements
      ...res.props.children,
      // Header
      this.FAV_FRIENDS.length > 0 && (() => React.createElement('h2', { className: `bf-fav-friends-header ${classes.privateChannelsHeaderContainer} container-2ax-kl` },
        [ React.createElement('span', { className: classes.headerText }, 'Favorite Friends'),
          React.createElement('svg', {
            className: `bf-expand-fav-friends ${this.expanded ? 'expanded' : 'collapsed'}`,
            height: 15,
            width: 20,
            viewBox: '0 0 20 20',
            onClick: async () => {
              this.expanded = !this.expanded;
              await sleep(10);
              forceUpdateElement('.' + classes.privateChannels);
            }
          }, React.createElement('path', {
            fill: 'rgb(185, 187, 190)',
            d: 'M4.516 7.548c0.436-0.446 1.043-0.481 1.576 0l3.908 3.747 3.908-3.747c0.533-0.481 1.141-0.446 1.574 0 0.436 0.445 0.408 1.197 0 1.615-0.406 0.418-4.695 4.502-4.695 4.502-0.217 0.223-0.502 0.335-0.787 0.335s-0.57-0.112-0.789-0.335c0 0-4.287-4.084-4.695-4.502s-0.436-1.17 0-1.615z'
          })
          ) ]
      )),
      // Friends
      this.expanded
        ? () => this.FAV_FRIENDS
          .sort((a, b) => lastMessageId(getDMFromUserId(b)) - lastMessageId(getDMFromUserId(a)))
          .map(userId => React.createElement(ConnectedPrivateChannel, { userId, currentSelectedChannel: res.props.selectedChannelId }))
        : null
    ];

    return res;
  });
  ConnectedPrivateChannelsList.default.displayName = 'ConnectedPrivateChannelsList';

  forceUpdateElement('.' + classes.privateChannels);
};
