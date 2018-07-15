import React from 'react';
import ReactDOM from 'react-dom';

const Dashboard = props => (
  <div id="dashboard">
    <h1>P2P Throwaway Chat</h1>

    <p>
      Start a new chat by clicking on 'Start a new chat' button which will give
      you an unique code that you can share with your chat partner. Your chat
      partner then needs to open this site and click on 'Join an existing
      channel' and provide the unique code.
    </p>

    <button onClick={props.startNewChat} disabled={props.isConnectedP2P}>
      Start a new Chat
    </button>
    <button onClick={props.joinExistingChannel} disabled={props.isConnectedP2P}>
      Join an existing Channel
    </button>
  </div>
);

export default Dashboard;
