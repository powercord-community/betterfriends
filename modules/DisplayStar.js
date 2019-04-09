const { waitFor, getOwnerInstance } = require('powercord/util');
const { inject } = require('powercord/injector');

const MAXIMUM_STAR_RENDER = 500;
let STARS_RENDERED = [];

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

  const createStar = async () => {
    await waitFor('.pc-username');
    STARS_RENDERED = STARS_RENDERED.sort((a, b) => a === b ? 0 : (a.compareDocumentPosition(b) & 2 ? 1 : -1));
    for (let element of [ ...document.querySelectorAll('span.pc-username') ].filter(elm => this.FAV_FRIENDS.includes(elm.parentElement.parentElement.parentElement.parentElement.getAttribute('data-author-id')) && ![ ...elm.classList ].includes('bf-star')).sort((a, b) => a === b ? 0 : (a.compareDocumentPosition(b) & 2 ? 1 : -1))) {
      STARS_RENDERED.push(element);
      element = element.parentNode;
      if (!element.querySelector('.bf-star')) {
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
      id: 'message',
      className: '.pc-message',
      func (res, original) {
        const { message } = res.props;
        const { author } = message;
        genericInjection(original, author.id);
      }
    },
    {
      id: 'member',
      className: '.pc-member',
      func (res, original) {
        if (original.props.children) {
          const id = original.props.children.props.children[0].props.children.props.src.split('/')[4];
          genericInjection(original, id);
        }
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
      func(this, res);
      return res;
    });
  }
};
