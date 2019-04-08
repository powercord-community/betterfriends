const { Plugin } = require('powercord/entities');
const { uninject } = require('powercord/injector');
const { React } = require('powercord/webpack');
const { resolve } = require('path');
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

    // Register settings menu for BetterFriends
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

    /*
     * Modules
     * Handled by the module resolver outside of `startPlugin`.
     * All modules are created by Nevulo#0007 unless stated otherwise. Contributors will be listed as well
     */

    // Store each of the modules above into this object where we can load them later
    this.MODULES = require('./modules');
    for (const module of Object.keys(this.MODULES)) {
      this.MODULES[module] = this.MODULES[module].bind(this);
    }
    this.log(this.MODULES);

    // Load the entire plugin + all modules
    this.load();
    // Unload all modules if this user has no favorite friends
    if (this.FAV_FRIENDS.length === 0) {
      this.unload();
    }
  }

  /*
   * Module Resolver + Handler
   * Handles the loading and unloading of all modules.
   */

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
        this.MODULES[load]();
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
      this.startPlugin();
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
