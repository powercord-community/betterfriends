const { waitFor, getOwnerInstance } = require('powercord/util');
const { React } = require('powercord/webpack');
const { inject } = require('powercord/injector');
const { Star } = require('./../components');

/*
 * [ Display Star ]
 * Handles the displaying of the little star emoji next to favorited friends in both chat and in member lists.
 */
module.exports = async function () {
  if (!this.settings.config.displaystar) {
    return;
  }
  await waitFor('.pc-username');
  await waitFor('.pc-message');

  const genericInjection = (res, id) => {
    if (this.FAV_FRIENDS.includes(id)) {
      if (res.props.children && res.props.children[0] && res.props.children[0].props && res.props.children[0].props.children && res.props.children[0].props.children[0]) {
        res.props.children[0].props.children[1].props.children.splice(1, 0, React.createElement(Star, { className: 'bf-star' }));
      }
    }
    return res;
  };

  const INJECT_INTO = [
    {
      id: 'message',
      className: '.pc-message',
      func (res, original) {
        const { message } = res.props;
        const { author } = message;
        return genericInjection(original, author.id);
      }
    },
    {
      id: 'member',
      className: '.pc-member',
      func (res, original) {
        if (original.props.children && original.props.children.props && original.props.children.props.children[0]) {
          const id = original.props.children.props.children[0].props.children.props.src.split('/')[4];
          return genericInjection(original, id);
        }
        return original;
      }
    }
  ];

  for (const injection of INJECT_INTO) {
    const { id, className, func } = injection;
    await waitFor(className);
    const selector = document.querySelector(className);
    const updateInstance = () =>
      (this.instance = getOwnerInstance(selector));
    const instancePrototype = Object.getPrototypeOf(updateInstance());
    updateInstance();

    inject(`bf-star-${id}`, instancePrototype, 'render', function (_, res) {
      return func(this, res);
    });
  }
};
