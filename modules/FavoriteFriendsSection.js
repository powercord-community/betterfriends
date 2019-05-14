const { AsyncComponent } = require('powercord/components');
const { waitFor, getOwnerInstance, sleep } = require('powercord/util');
const { React } = require('powercord/webpack');
const { inject } = require('powercord/injector');

/*
 * [ Favorite Friends Section ]
 * This module handles the loading and creation of the "Favorited" section that is injected via BetterFriends.
 * Contributors: aetheryx#0001
 */
module.exports = async function () {
  let ALL_FRIENDS = [];
  const Item = AsyncComponent.from('Item');
  if (!document.querySelector('.pc-tabBar')) {
    await waitFor('.pc-tabBar');
  }
  if (!document.querySelector('.friendsRow-2yicud')) {
    await waitFor('.friendsRow-2yicud');
  }
  const TOP_BAR = document.querySelector('.pc-tabBar');
  const COMPONENTS = {
    FRIEND_TABLE: getOwnerInstance(document.querySelector('.friendsTable-133bsv')),
    FRIEND_TABLE_HEADER: getOwnerInstance(document.querySelector('.friendsTableHeader-32yE7d')),
    FRIEND_ROW: getOwnerInstance(document.querySelector('.friendsRow-2yicud'))
  };
  TOP_BAR.classList.add('bf-friends-top-bar');

  const updateFavoriteFriendsTabInstance = () =>
    (this.favoriteFriendsTabInstance = getOwnerInstance(TOP_BAR));
  const instancePrototype = Object.getPrototypeOf(updateFavoriteFriendsTabInstance());
  updateFavoriteFriendsTabInstance();

  const populateFavoriteFriends = () => {
    const originalRows = COMPONENTS.FRIEND_TABLE.state.rows;
    if (!originalRows._rows) {
      originalRows._rows = originalRows;
    }
    if (!ALL_FRIENDS.length) {
      ALL_FRIENDS = originalRows._rows;
    }
    originalRows._rows = ALL_FRIENDS
      .filter(n => this.FAV_FRIENDS.includes(n.key))
      .map(a => React.createElement(Item, a));
    COMPONENTS.FRIEND_TABLE.state.section = () => true;
  };

  const populateNormalFriends = () => {
    if (ALL_FRIENDS.length) {
      COMPONENTS.FRIEND_TABLE.state.rows._rows = ALL_FRIENDS;
    }
  };

  const select = (e) => {
    const { target } = e;
    target.classList.add('itemSelected-1qLhcL', 'selected-3s45Ha');
    this.log('Favorited button clicked');
    populateFavoriteFriends();
    COMPONENTS.FRIEND_TABLE.forceUpdate();
    COMPONENTS.FRIEND_TABLE.render();
  };

  inject('bf-favorite-friends-tabbar-mount', instancePrototype, 'componentDidMount', () => {
    this.log('Tab bar mounted');
  });

  inject('bf-friends-table-render', COMPONENTS.FRIEND_TABLE, 'render', (a, res) => {
    console.log(res.props.children[0].props.children[3].props);
    if (res.props.children[0].props.children[3].props.selectedItem.toString() === '() => true') {
      console.log(res.props.children[1].props.children[1].props);
      res.props.children[1].props.children[1].props.children = ALL_FRIENDS
        .filter(n => this.FAV_FRIENDS.includes(n.key))
        .map(a => React.createElement(res.props.children[1].props.children[1].props.children[0].type || 'div', a));
      this.log('Populating friends list');
    } else {
      populateNormalFriends();
    }
    return res;
  });

  inject('bf-favorite-friends-tabbar', instancePrototype, 'render', (args, res) => {
    this.log('Tab bar rendered');
    this.log(`Current selected item is ${res.props.children[0].props.selectedItem}`);
    if (res.props.children[0].props.selectedItem.toString() === '() => true') {
      populateFavoriteFriends();
      this.log('Re-rendered friend table');
    } else {
      populateNormalFriends();
    }
    COMPONENTS.FRIEND_TABLE.render();

    const FAV_FRIENDS_BUTTON = React.createElement(Item, {
      id: 'FAVORITED',
      selectedItem: res.props.children[0].props.selectedItem,
      itemType: 'topPill-30KHOu',
      className: 'itemDefault-3Jdr52 item-PXvHYJ item-3HpYcP',
      onMouseDown () {
        console.log('clicked')
        res.props.children[1].props.id = 'FAVORITED';
        res.props.children[1].props.selectedItem = '() => true';
        COMPONENTS.FRIEND_TABLE.render();
      }
    }, 'Favorited');

    // Only inject in the first 'All' button
    console.log(res.props.children);
    if (res.props.children && res.props.children[1] && res.props.children[1].props.children === 'All') {
      res.props.children.splice(2, 0, FAV_FRIENDS_BUTTON);
    }
    return res;
  });
  this.favoriteFriendsTabInstance.componentDidMount();
};
