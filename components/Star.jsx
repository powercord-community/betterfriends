const { React } = require('powercord/webpack');
const { Tooltip } = require('powercord/components');

module.exports = ({ className }) => (
  <Tooltip className={`bf-star-tooltip`} text='Favorited Friend' position='top'>
    <div className={`${className} bf-star`}></div>
  </Tooltip>
);
