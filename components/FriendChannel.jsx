const { React } = require('powercord/webpack');
module.exports = ({ user, status, statuses }) => (
  <div class="channel-2QD9_O pc-channel" style={{ height: '42px',
    opacity: 1 }}>
    <a href={`/channels/@me/${user.id}`}>
      <div class="wrapper-2F3Zv8 pc-wrapper small-5Os1Bb pc-small forceDarkTheme-2cI4Hb pc-forceDarkTheme avatar-28BJzY pc-avatar avatarSmall-3ACRaI">
        <div user={user.username} status={status} class="inner-1W0Bkn pc-inner stop-animation" style={{ backgroundImage: `url(${user.avatarURL})` }}></div>
        <div class={`${statuses[status]} status-oxiHuE pc-${status} pc-status small-5Os1Bb pc-small status-2zcSVk pc-status status-1ibiUI pc-status`}></div>
      </div>
      <div class="nameWrapper-10v56U pc-nameWrapper"><span class="name-2WpE7M pc-name">{user.username}</span></div>
    </a>
  </div>
);
