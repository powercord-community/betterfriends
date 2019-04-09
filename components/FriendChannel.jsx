const { React } = require('powercord/webpack');
const { getModule } = require('powercord/webpack');
const { getDMFromUserId } = getModule([ 'getDMFromUserId' ]);
const { open: openModal } = require('powercord/modal');
const { transitionTo } = getModule([ 'transitionTo' ]);
const InformationModal = require('./InformationModal');
const { Tooltip } = require('powercord/components');
const { Info } = require('powercord/components/Icons');
const { Statuses } = require('./../Constants');
const { config: { infomodal } } = powercord.pluginManager.get('betterfriends').settings;

module.exports = class BetterFriendChannel extends React.Component {
  constructor ({ user, status, data }) {
    super();

    this.user = user;
    this.status = status;
    this.data = data;

    // bind this to button click event
    this.informationClick = this.informationClick.bind(this);
  }

  // no usage of "this", no need to bind
  userClick (e) {
    e.stopPropagation();
    e.preventDefault();

    let { target } = e;
    const callNewTarget = () => {
      target = target.parentNode;
      if (![ ...target.classList ].includes('pc-channel')) {
        callNewTarget();
      }
    };
    callNewTarget();

    transitionTo(target.firstChild.getAttribute('href'));
    for (const elm of [ ...document.querySelectorAll('.pc-friendchannel.pc-selected') ]) {
      elm.classList.remove('selected-1HYmZZ', 'pc-selected');
    }
    target.classList.add('selected-1HYmZZ', 'pc-selected');
  }

  informationClick (e) {
    e.preventDefault();
    const info = this.data.FRIEND_DATA.lastMessageID[this.user.id];
    openModal(() => React.createElement(InformationModal, {
      user: this.user,
      channel: !info ? 'nothing' : info.channel,
      message: !info ? 'nothing' : info.id
    }));
    e.stopPropagation();
  }

  render () {
    return (
      <div class="channel-2QD9_O pc-channel pc-friendchannel" style={{ height: '42px',
        opacity: 1 }}>
        <a href={`/channels/@me/${getDMFromUserId(this.user.id)}`} onClick={this.userClick}>
          <div class="wrapper-2F3Zv8 pc-wrapper small-5Os1Bb pc-small forceDarkTheme-2cI4Hb pc-forceDarkTheme avatar-28BJzY pc-avatar avatarSmall-3ACRaI">
            <div user={this.user.username} status={this.status} class="inner-1W0Bkn pc-inner stop-animation" style={{ backgroundImage: `url(${this.user.avatarURL})` }}></div>
            <div class={`${Statuses[this.status].class} status-oxiHuE pc-${this.status} pc-status small-5Os1Bb pc-small status-2zcSVk pc-status status-1ibiUI pc-status`}></div>
          </div>
          <div class="nameWrapper-10v56U pc-nameWrapper"><span class="name-2WpE7M pc-name">{this.user.username}</span></div>
          {() => {
            if (infomodal) {
              return <Info class="bf-information" onClick={this.informationClick}>
                <Tooltip class="bf-information-tooltip" text='User Information' position='top'></Tooltip>
              </Info>;
            }
          }}

        </a>
      </div>
    );
  }
};
