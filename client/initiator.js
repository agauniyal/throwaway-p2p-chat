import Peer from 'simple-peer';
import Io from 'socket.io-client';
import swal from 'sweetalert2';

export default class Initiator {
  constructor(onServerConnect, onPeerConnect, onMessage) {
    this.peer = new Peer({ initiator: true });
    this.socket = Io();
    this.onMessage = onMessage;
    this.onServerConnect = onServerConnect;
    this.onPeerConnect = onPeerConnect;

    this.socket.on('connect', async () => {
      await this.onServerConnect(true);
      console.info('Initiator connected to server');
    });
    this.socket.on('disconnect', async () => {
      await this.onServerConnect(false);
      console.warn('Initiator disconnected from server');
    });
    this.socket.on('error', () => {
      swal(
        'Socket Error',
        'An error occurred with initiator socket, please see developer console for more information',
        'error'
      );
      console.log(err);
    });

    this.peer.on('close', async () => {
      await this.onPeerConnect(false);
      swal('Connection Terminated', 'P2P client closed connection', 'warning');
    });
    this.peer.on('data', data => this.onMessage(data.toString()));
    this.peer.on('error', err => {
      swal(
        'Initiator Error',
        'An error occurred with initiator peer, please see developer console for more information',
        'error'
      );
      console.log(err);
    });
  }

  sendMessage = msg => {
    this.peer.send(msg.toString());
  };

  generateSignal = () => {
    return new Promise((resolve, reject) => {
      this.peer.on('signal', signal => {
        resolve(signal);
      });
    });
  };

  getUrl = signal => {
    return new Promise((resolve, reject) => {
      this.socket.emit('getUrl', signal, url => {
        resolve(url);
      });
    });
  };

  connectToPeer = () => {
    return new Promise((resolve, reject) => {
      this.socket.on('getReceiverSignal', otherSignal => {
        this.peer.on('connect', async () => {
          console.info('Initiator connected to peer');
          await this.onPeerConnect(true);
          resolve();
        });
        this.peer.signal(otherSignal);
      });
    });
  };
}
