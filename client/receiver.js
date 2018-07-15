import Peer from 'simple-peer';
import Io from 'socket.io-client';
import swal from 'sweetalert2';

export default class Receiver {
  constructor(onServerConnect, onPeerConnect, onMessage) {
    this.peer = new Peer();
    this.socket = Io();
    this.onMessage = onMessage;
    this.onServerConnect = onServerConnect;
    this.onPeerConnect = onPeerConnect;

    this.socket.on('connect', async () => {
      await this.onServerConnect(true);
      console.info('Receiver connected to server');
    });
    this.socket.on('disconnect', async () => {
      await this.onServerConnect(false);
      console.warn('Receiver disconnected to server');
    });
    this.socket.on('error', err => {
      swal(
        'Socket Error',
        'An error occurred with receiver socket, please see developer console for more information',
        'error'
      );
      console.log(err);
    });

    this.peer.on('connect', async () => {
      console.info('Receiver connected to peer');
      await this.onPeerConnect(true);
    });
    this.peer.on('close', async () => {
      await this.onPeerConnect(false);
      swal('Connection Terminated', 'P2P client closed connection', 'warning');
    });
    this.peer.on('data', data => {
      this.onMessage(data.toString());
    });
    this.peer.on('error', err => {
      swal(
        'Receiver Error',
        'An error occurred with receiver peer, please see developer console for more information',
        'error'
      );
      console.log(err);
    });
  }

  sendMessage = msg => {
    this.peer.send(msg.toString());
  };

  getInitiatorSignal = url => {
    return new Promise((resolve, reject) => {
      this.socket.emit('getInitiatorSignal', url, otherSignal => {
        if (otherSignal !== '') {
          resolve(otherSignal);
        } else {
          swal(
            'Wrong channel code',
            'Could not find associated channel with provided unique code',
            'error'
          );
          reject('No channel found with given id');
        }
      });
    });
  };

  generateSignal = otherSignal => {
    return new Promise((resolve, reject) => {
      this.peer.on('signal', signal => {
        resolve(signal);
      });
      this.peer.signal(otherSignal);
    });
  };

  connectToPeer = (signal, url) => {
    return new Promise((resolve, reject) => {
      this.socket.emit('sendReceiverSignal', [signal, url], success => {
        if (success) {
          this.socket.disconnect();
          resolve();
        } else {
          swal(
            'Wrong channel code',
            'Could not find associated channel with provided unique code',
            'error'
          );
          reject('Invalid url for channel');
        }
      });
    });
  };
}
