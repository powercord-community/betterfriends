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
      statusStorage: {},
      lastMessageID: {}
    };
    const MAXIMUM_STAR_RENDER = 500;
    let STARS_RENDERED = [];

    await waitFor('.pc-message');
    await waitFor('.pc-username');
    const getUser = getModule([ 'getUser' ]);
    const { getStatus } = getModule([ 'getStatus' ]);

    const showStars = true || this.settings.config.showStar;

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

    this.information = () => {
      inject('bf-user', getUser, 'getUser', (args, res) => {
        if (res && this.FAV_FRIENDS.includes(res.id)) {
          // add this
        }
      });
    };


    this.star = () => {
      const createStar = async () => {
        await waitFor('.pc-username');
        STARS_RENDERED = STARS_RENDERED.sort((a, b) => a === b ? 0 : (a.compareDocumentPosition(b) & 2 ? 1 : -1));
        for (let element of [ ...document.querySelectorAll('span.pc-username') ].filter(elm => this.FAV_FRIENDS.includes(elm.parentElement.parentElement.parentElement.parentElement.getAttribute('data-author-id')) && ![ ...elm.classList ].includes('bf-star')).sort((a, b) => a === b ? 0 : (a.compareDocumentPosition(b) & 2 ? 1 : -1))) {
          STARS_RENDERED.push(element);
          element = element.parentNode;
          if (showStars && !element.querySelector('.bf-star')) {
            const starElement = document.createElement('span');
            starElement.classList.add('bf-star', 'bf-username');
            element.appendChild(starElement);
          }
        }
      };

      const genericInjection = (res, id) => {
        res.props['data-author-id'] = id;
        if (this.FAV_FRIENDS.includes(id)) {
          if (STARS_RENDERED.length > MAXIMUM_STAR_RENDER) {
            for (const username of STARS_RENDERED) {
              username.classList.remove('bf-star');
              STARS_RENDERED = STARS_RENDERED.filter(item => item !== username);
            }
          }
          createStar();
        }
      };

      const INJECT_INTO = [
        {
          className: '.pc-message',
          func (res, original) {
            const { message } = res.props;
            const { author } = message;
            genericInjection(original, author.id);
          }
        },
        {
          className: '.pc-member',
          func (res, original) {
            const id = original.props.children.props.children[0].props.children.props.src.split('/')[4];
            genericInjection(original, id);
          }
        }
      ];

      for (const injection of INJECT_INTO) {
        const { className, func } = injection;
        const selector = document.querySelector(className);
        const updateInstance = () =>
          (this.instance = getOwnerInstance(selector));
        const instancePrototype = Object.getPrototypeOf(updateInstance());
        updateInstance();

        inject(`bf-star-${className}`, instancePrototype, 'render', function (_, res) {
          func(this, res);
          return res;
        });
      }
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

            for(const friend of [ ...document.querySelectorAll('.pc-friendchannel') ]) {
              if(friend.querySelector('.pc-inner').getAttribute('user') === res.username) {
                const statusDiv = friend.querySelector('.pc-status')
                statusDiv.classList.remove(statuses[previous].class)
                statusDiv.classList.add(statuses[status].class)
              }
            }
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
        (this.statusPopupInstance = getOwnerInstance(injector));
      const instancePrototype = Object.getPrototypeOf(updateInstance());
      updateInstance();


      inject('bf-friendsList', instancePrototype, 'render', (args, res) => {
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
        this.log('Injected into friends panel!');
        if (res.props.children.props.to.pathname === '/channels/@me') {
          return [ res, FAV_FRIENDS_HEADER, ...friends ];
        }
        return res;
      });
      this.statusPopupInstance.forceUpdate();
    };

    // Load modules
    this.MODULES = {
      friends: this.friends,
      statusPopup: this.statusPopup,
      star: this.star
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
