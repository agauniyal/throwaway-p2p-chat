import React from 'react';
import ReactDOM from 'react-dom';

class Chat extends React.Component {
  constructor() {
    super();
    this.state = {
      inputValue: ''
    };
  }

  componentDidUpdate = () => {
    const elementUL = document.getElementById('chat').children[0];
    const lastElem = elementUL.children[elementUL.childElementCount - 1];
    if (lastElem) {
      lastElem.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
        inline: 'end'
      });
    }
  };

  onEnterPress = e => {
    if (e.keyCode == 13 && e.shiftKey == false) {
      e.preventDefault();
      this.props.onSend(this.state.inputValue);
      this.setState({ inputValue: '' });
    }
  };

  updateInputValue(e) {
    this.setState({
      inputValue: e.target.value
    });
  }

  render() {
    return (
      <div id="chat">
        <ul>
          {this.props.messages.map(m => (
            <li className={m.type} key={m.id.toString()}>
              {m.text}
            </li>
          ))}
        </ul>

        <textarea
          id="message-box"
          onKeyDown={this.onEnterPress}
          value={this.state.inputValue}
          onChange={e => this.updateInputValue(e)}
        />
      </div>
    );
  }
}

export default Chat;
