//TODO:
// support descriptions

import React from 'react';

import GSheetReader from 'g-sheets-api'

const squareCnt = 25;

function randomInt(min, max) {
  return Math.floor(Math.random() * max + min);
}

function randomSquares(data,n) {
  let rndSet = new Set();
  let rndArray = Array(n);
  const max = data.length - 1;
  console.log(max);
  while (rndSet.size < n) {
    const i = randomInt(0, max);
    if (!rndSet.has(i)) {
      console.log(data[i]);
      const rarity = (data[i].rarity ? data[i].rarity : 1)
      if (rarity >= Math.random()) {
        rndSet.add(i);
        rndArray[rndSet.size - 1] = data[i];
      }
    }
  }
  return rndArray;
}

function Square(props) {
  return (
    <button id={'sq' + props.id} className={'square' + (props.state ? ' checked' : '')} onClick={props.onClick}>
      {props.value}
    </button>
  );
}

function Board(props) {
  return props.squares.map((square) => <Square key={square.id} id={square.id} value={square.value} state={square.state} onClick={() => props.onClick(square.id)} />);
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    // handle custom title
    const title = props.title ? props.title : 'BINGO';
    // handle custom dataset
    if (props.dataset) {
      this.dataset = props.dataset;
      if (props.dataset === 'CocoSpeed') {
        let tmpData = [];
        const options = {
          apiKey: 'AIzaSyCG-9qmMIr-LQHGpSRZTin4hlUI-vhMhnY',
          sheetId: '1_-k6lQkb_LIquDp5OQcKAbhq2C4q_xekPaO5W5-ywhs',
          sheetName: 'Speedrun',
          returnAllResults: true,
        }
        GSheetReader(options, results => {
          tmpData = results;
          console.log(tmpData);
        }).catch(err => {
          console.log(err);
        });
        this.data = tmpData;
      }
    } else {
      this.dataset = 'BINGO';
      const tmpData = Array(75).fill({});
      for (let i = 0; i < tmpData.length;i++) {
        tmpData[i] = {"value":i+1};
      }
      this.data = tmpData;
    }
    this.minId = 0;
    this.maxId = this.data.length - 1;
    // check for saved data
    const prevState = localStorage.getItem(this.dataset);
    if (prevState) {
      this.state = JSON.parse(prevState);
    } else {
      this.state = { title: title, squares: Array(squareCnt).fill({}) };
      const rndArray = randomSquares(this.data,squareCnt);
      for (let i = 0; i < this.state.squares.length; i++) {
        this.state.squares[i] = { id: i, value: rndArray[i].value, desc: '', state: false, };
      }
      localStorage.setItem(this.dataset,JSON.stringify(this.state));
    }
  }

  handleClick(i) {
    let newState = this.state;
    const square = newState.squares[i];
    newState.squares[i].state = !square.state;
    this.setState(newState);
    localStorage.setItem(this.dataset,JSON.stringify(this.state));
  }

  handleClear() {
    let newState = this.state;
    for (let i = 0; i < newState.squares.length; i++) {
      newState.squares[i].state = false;
    }
    this.setState(newState);
    localStorage.setItem(this.dataset,JSON.stringify(this.state));
  }

  handleNew() {
    let newState = this.state;
    const rndArray = randomSquares(this.data,squareCnt);
    for (let i = 0; i < newState.squares.length; i++) {
      newState.squares[i].state = false;
      newState.squares[i].value = rndArray[i].value;
    }
    this.setState(newState);
    localStorage.setItem(this.dataset,JSON.stringify(this.state));
  }

  render() {
    return (
      <div className='game'>
        <header>
          <h1 className='game-title'>
            {this.state.title}
          </h1>
          <div className='game-controls'>
            <button onClick={() => this.handleClear()}>Clear</button>
            <button onClick={() => this.handleNew()}>New Card</button>
          </div>
        </header>
        <div className='game-board'>
          <Board
            squares={this.state.squares}
            onClick={(i) => this.handleClick(i)}
          />
        </div>
      </div>
    );
  }
}

export default Game;
