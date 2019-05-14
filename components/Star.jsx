const { React } = require('powercord/webpack');
const { Tooltip } = require('powercord/components');

module.exports = ({ className }) => (
  <Tooltip className={`bf-star-tooltip ${className}`} text='Favorited Friend' position='top'>
    <div className='bf-star'></div>
  </Tooltip>
);
