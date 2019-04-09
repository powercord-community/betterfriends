const { waitFor, getOwnerInstance } = require('powercord/util');
const { React, getModule } = require('powercord/webpack');
const { inject } = require('powercord/injector');

/*
 * [ Favorite Friends Section ]
 * This module handles the loading and creation of the "Favorited" section that is injected via BetterFriends.
 * Contributors: aetheryx#0001
 */
module.exports = async function () {
  if (!document.querySelector('.pc-tabBar')) {
    await waitFor('.pc-tabBar');
  }
  if (!document.querySelector('.friendsRow-2yicud')) {
    await waitFor('.friendsRow-2yicud');
  }
  const TOP_BAR = document.querySelector('.pc-tabBar');
  const { setSection } = await getModule(t => t.setSection && Object.keys(t).length === 1);
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
    const rows = originalRows._rows.filter(n => this.FAV_FRIENDS.includes(n.key));

    // instancePrototype.props.children[0].props.selectedItem = 'FAVORITED';
    COMPONENTS.FRIEND_TABLE.setState({
      rows,
      section: () => true
    });
  };

  const select = (e) => {
    this.log('Favorited button clicked');
    setSection('FAVORITED');
    populateFavoriteFriends();
    const { target } = e;
    target.classList.add('itemSelected-1qLhcL', 'selected-3s45Ha', 'pc-itemSelected', 'pc-selected');
  };

  inject('bf-favorite-friends-tabbar', instancePrototype, 'render', (args, res) => {
    if (res.props.children[0].props.selectedItem === 'FAVORITED') {
      populateFavoriteFriends();
    } else {
      const elm = [ ...document.querySelectorAll('.itemSelected-1qLhcL.selected-3s45Ha') ].find(a => a.innerHTML === 'Favorited');
      if (elm) {
        elm.classList.remove('itemSelected-1qLhcL', 'selected-3s45Ha', 'pc-itemSelected', 'pc-selected');
      }
    }

    const FAV_FRIENDS_BUTTON = React.createElement('div', {
      id: 'FAVORITED',
      selectedItem: res.props.children[0].props.selectedItem,
      itemType: 'topPill-30KHOu',
      className: 'itemDefault-3Jdr52 item-PXvHYJ notSelected-1N1G5p pc-itemDefault pc-item pc-notSelected item-3HpYcP pc-item',
      onMouseDown: select
    }, 'Favorited');

    // Only inject in the first 'All' button
    if (res.props.children && res.props.children[2] && res.props.children[2].props.children === 'All') {
      res.props.children.splice(3, 0, FAV_FRIENDS_BUTTON);
    }
    return res;
  });
};
