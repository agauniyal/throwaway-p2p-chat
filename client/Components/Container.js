import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import swal from 'sweetalert2';

import Dashboard from './Dashboard';
import Chat from './Chat';

import initiator from '../initiator';
import receiver from '../receiver';

class Container extends Component {
  constructor() {
    super();
    this.state = {
      counter: 0,
      messages: [
        { id: 1, text: 'Hey', type: 'left-message' },
        { id: 2, text: 'Hi! How are you?', type: 'right-message' },
        { id: 3, text: 'long time no see..', type: 'right-message' },
        {
          id: 4,
          text: 'yeah was busy for a while, finally got some time around',
          type: 'left-message'
        },
        {
          id: 5,
          text: 'wbu? I heard you got a fancy car now!',
          type: 'left-message'
        },
        { id: 6, text: 'yeah, coming to pick you up rn', type: 'right-message' }
      ],
      peer: null,
      conectedServer: false,
      connectedP2P: false
    };
  }

  onServerConnect = isConnected => {
    return new Promise((resolve, reject) => {
      this.setState(
        {
          ...this.state,
          conectedServer: isConnected === true
        },
        () => resolve()
      );
    });
  };

  onPeerConnect = isConnected => {
    return new Promise((resolve, reject) => {
      this.setState(
        {
          ...this.state,
          connectedP2P: isConnected === true
        },
        () => resolve()
      );
    });
  };

  addNewMessage = (direction, message) => {
    const latestMessage = {
      id: this.state.counter,
      text: message,
      type: direction == 'right' ? 'right-message' : 'left-message'
    };
    const messages = [...this.state.messages, latestMessage];
    this.setState({
      ...this.state,
      counter: this.state.counter + 1,
      messages
    });
  };

  sendNewMessage = message => {
    if (this.state.connectedP2P) {
      this.state.peer.sendMessage(message);
      this.addNewMessage('right', message);
    } else {
      swal(
        'Warning',
        "P2P clients aren't connected, please join a channel first",
        'warning'
      );
    }
  };

  startNewChat = () => {
    this.setState(
      {
        ...this.state,
        messages: [],
        peer: new initiator(
          this.onServerConnect,
          this.onPeerConnect,
          this.addNewMessage.bind(this, 'left')
        )
      },
      async () => {
        const signal = await this.state.peer.generateSignal();
        const url = await this.state.peer.getUrl(signal);
        swal('One time unique code', url, 'info');
        await this.state.peer.connectToPeer();
      }
    );
  };

  joinExistingChannel = () => {
    this.setState(
      {
        ...this.state,
        messages: [],
        peer: new receiver(
          this.onServerConnect,
          this.onPeerConnect,
          this.addNewMessage.bind(this, 'left')
        )
      },
      async () => {
        const { value: url } = await swal({
          title: 'Enter channel unique code?',
          input: 'text',
          showCancelButton: false,
          inputValidator: value => {
            return !value && 'You need to write something!';
          }
        });
        const otherSignal = await this.state.peer.getInitiatorSignal(url);
        const signal = await this.state.peer.generateSignal(otherSignal);
        await this.state.peer.connectToPeer(signal, url);
      }
    );
  };

  render() {
    return [
      <Dashboard
        startNewChat={this.startNewChat}
        joinExistingChannel={this.joinExistingChannel}
        isConnectedP2P={this.state.connectedP2P}
      />,
      <Chat messages={this.state.messages} onSend={this.sendNewMessage} />
    ];
  }
}

export default Container;
