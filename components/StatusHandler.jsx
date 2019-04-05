const { React } = require('powercord/webpack');
module.exports = ({ statuses, status, user }) => (
  <div class="bf-status-popup">
    <div style={{ float: 'left' }} class="wrapper-2F3Zv8 pc-wrapper small-5Os1Bb pc-small">
      <div class="image-33JSyf pc-image small-5Os1Bb pc-small mask-3OgeRz pc-mask" style={{ backgroundImage: `url(${user.avatarURL})` }} />
      <div class={`pc-${status} ${statuses[status].class} status-oxiHuE pc-status small-5Os1Bb pc-small animate-iYrs3- pc-animate statusAnimated-1SvwJ- statusStatic-3QpK4G status-2s6iDp pc-statusAnimated`} />
    </div>
    <div style={{ float: 'right',
      marginLeft: '14px',
      marginTop: '8px' }} class="bf-status-popup-text">{user.username} is now {statuses[status].friendly}.</div>
  </div>
);
