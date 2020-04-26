const { React } = require('powercord/webpack');
const { Statuses } = require('./../Constants');

module.exports = ({ status, user, Avatar }) => (
  <div class="bf-status-popup">
    <div class='bf-status-userinline'>
      <Avatar src={user.avatarURL} status={status} size='SIZE_32' statusTooltip={true} />
      <div style={{ marginLeft: '8px',
        marginTop: '8px' }} class="bf-status-popup-text">{user.username} is now {Statuses[status].friendly}</div>
    </div>
  </div>
);
