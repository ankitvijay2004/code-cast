import React from 'react';
import Avatar from 'react-avatar';

function Client({username}) {

  return (
    <div className="member-item">
      <Avatar name={username.toString()} size={46} round="16px" className="member-avatar" />
      <div className="member-meta">
        <span className='member-name'>{username.toString()}</span>
        <span className='member-role'>Active collaborator</span>
      </div>
      <span className="member-status-dot" />
    </div>
  );
}

export default Client;
