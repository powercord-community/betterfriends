const { Plugin } = require('powercord/entities');
const { inject, uninject } = require('powercord/injector');
const { waitFor, getOwnerInstance, sleep, createElement } = require('powercord/util');
const { React, ReactDOM, getModule } = require('powercord/webpack');
const { Toast } = require('powercord/components');
const { resolve } = require('path');
const { StatusHandler, FriendChannel } = require('./components');
const Settings = require('./Settings');


module.exports = class BetterFriends extends Plugin {
  /**
   * Start the plugin
   */
  async startPlugin () {
    // Constants
    this.FAV_FRIENDS = this.settings.get('favfriends');
    this.FRIEND_DATA = {
      statusStorage: {}
    };

    // Retrieve Mango's user object
    await waitFor('.pc-message');
    await waitFor('.pc-username');
    const getUser = getModule([ 'getUser' ]);
    const { getStatus } = getModule([ 'getStatus' ]);
    const getMember = getModule([ 'getMember' ]);

    // Register plugin in Settings menu
    this.registerSettings(
      'betterfriends',
      'Better Friends',
      () =>
        React.createElement(Settings, {
          settings: this.settings
        })
    );

    // Handle CSS
    this.loadCSS(resolve(__dirname, 'style.scss'));

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

    this.statusPopup = () => {
      inject('bf-user', getUser, 'getUser', (args, res) => {
        if (res && this.FAV_FRIENDS.includes(res.id)) {
          const status = getStatus(res.id);
          const previous = this.FRIEND_DATA.statusStorage[res.id];
          if (previous && status !== previous) {
            this.log('Showing notification');
            const container = createElement('div', { id: 'bf-friend-status-popup' });
            document.body.appendChild(container);
            const Notification = React.createElement(Toast, {
              header: React.createElement(StatusHandler, { statuses,
                status,
                user: res }),
              style: {
                bottom: '25px',
                right: '25px',
                height: 'auto',
                display: 'block',
                padding: '20px'
              },
              buttons: []
            });
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

    this.friends = async () => {
      if (!document.querySelector('.pc-privateChannels')) {
        await waitFor('.pc-privateChannels');
      }
      const DIRECT_MESSAGES_HEADER = [ ...document.querySelectorAll('header') ].find(a => a.innerHTML === 'Direct Messages');
      DIRECT_MESSAGES_HEADER.parentNode.classList.add('bf-friends-scroller');
      const original = document.querySelector('.pc-privateChannels .pc-scrollerWrap .pc-scroller');
      const injector = original.querySelector('div :nth-child(4)');

      const updateInstance = () =>
        (this.instance = getOwnerInstance(injector));
      const instancePrototype = Object.getPrototypeOf(updateInstance());
      updateInstance();

      const friends = [];
      for (const id of this.FAV_FRIENDS) {
        const friend = getUser.getUser(id);
        if (!this.FRIEND_DATA.statusStorage[friend.id]) {
          this.FRIEND_DATA.statusStorage[friend.id] = getStatus(friend.id);
        }
        friends.push(React.createElement(FriendChannel, { user: friend,
          status: this.FRIEND_DATA.statusStorage[friend.id] || 'offline',
          statuses }));
      }

      const FAV_FRIENDS_HEADER = React.createElement('header',
        { key: '.3',
          children: 'Favorite Friends'
        });

      inject('bf-friendsList', instancePrototype, 'render', (args, res) => {
        this.log('Injected into friends panel!');
        this.log(res);
        if (res.props.children.props.to.pathname === '/channels/@me') {
          return [ res, FAV_FRIENDS_HEADER, ...friends ];
        }
        return res;
      });
    };

    // Load modules
    this.MODULES = {
      friends: this.friends,
      statusPopup: this.statusPopup
    };
    this.load();
  }

  /**
   * Load one or multiple modules
   * When no module is specified, all modules are loaded by default.
   * @param {String} specific Pass a specific module name to load only that module
   */
  load (specific) {
    if (specific) {
      this[specific]();
    } else {
      for (const load of Object.keys(this.MODULES)) {
        this[load]();
      }
    }
  }

  /**
   * Unload one or multiple modules
   * When no module is specified, the entire plugin is unloaded from Powercord.
   * @param {String} specific Pass a specific module name to unload only that module
   */
  unload (specific) {
    if (specific) {
      uninject(`bf-${specific}`);
    } else {
      this.log('Plugin stopped');
      for (const unload of Object.keys(this.MODULES)) {
        uninject(`bf-${unload}`);
      }
      this.unloadCSS();
    }
  }

  pluginWillUnload () {
    this.unload();
  }

  /**
   * Reload (unload and then load) one or multiple modules
   * When no module is specified, the entire plugin will reload
   * @param {String} specific Pass a specific module name to reload only that module
   */
  reload (specific) {
    if (specific) {
      this.log(`Reloading module '${specific}'`);
      this.unload(specific);
      this.load(specific);
    } else {
      this.log('Reloading all modules');
      this.unload();
      this.start();
    }
  }

  /**
   * Log a string or data to the developer console
   * Overwrites the normal Powercord .log method.
   * @param {any} data Data to log
   */
  log (data) {
    console.log('%c[ Better Friends ]', 'color: #ffeb3b', data);
  }
};
