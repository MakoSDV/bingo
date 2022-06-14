import React from 'react';

import GSheetReader from 'g-sheets-api'

import Loader from 'react-loader-spinner'

const squareCnt = 25;
const gsApiKey = 'AIzaSyCG-9qmMIr-LQHGpSRZTin4hlUI-vhMhnY';
const gsId = '1_-k6lQkb_LIquDp5OQcKAbhq2C4q_xekPaO5W5-ywhs';

function randomInt(min, max) {
  return Math.floor(Math.random() * max + min);
}

function randomSquares(data, n) {
  let rndSet = new Set();
  let rndArray = Array(n);
  const max = data.length;
  if (max >= 0) {
    while (rndSet.size < n) {
      const i = randomInt(0, max);
      if (!rndSet.has(i)) {
        const rarity = (data[i].rarity ? data[i].rarity : 1)
        if (rarity >= Math.random()) {
          rndSet.add(i);
          //handle multiple exclusive options for square
          let sq = { ...data[i] }; // clone the data object
          if (typeof data[i].value === 'string') { // ignore this for the plain Bingo with just numbers
            if (data[i].value.includes('||')) {
              let valueOptions = data[i].value.split('||')
              let optId = randomInt(0, valueOptions.length);
              sq.value = valueOptions[optId];
              if (data[i].desc && data[i].desc.includes('||')) {
                let descOptions = data[i].desc.split('||');
                if (optId < descOptions.length) {
                  sq.desc = descOptions[optId];
                } else {
                  sq.desc = descOptions[0]; // handle if the descriptions are too short
                }
              }
            }
          }
          rndArray[rndSet.size - 1] = sq;
        }
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

function Descriptions(props) {
  const descriptions = [];
  for (let i = 0; i < props.squares.length; i++) {
    if (props.squares[i].desc) { descriptions.push({ id: props.squares[i].id, value: props.squares[i].value, desc: props.squares[i].desc }); }
  }
  return (
    descriptions.length > 0 ?
      <div className='descriptions'>
        <h2>Square Info:</h2>
        <ul className='descList'>
          {descriptions.map((square) => square.desc ? <li className='desc' key={square.id}><span className='descTitle'>{square.value}:</span> {square.desc}</li> : '')}
        </ul>
      </div>
      : ''
  );
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    // handle custom title
    const title = props.title ? props.title : 'BINGO';
    this.dataset = props.dataset ? props.dataset : 'BINGO';
    this.state = { loading: true, title: title, data: [], squares: [] };
  }

  componentDidMount() {
    if (this.state.loading) {
      this.getData(this.props);
    }
  }

  getData = async (props) => {
    let newState = this.state;
    let tmpData = [];
    if (props.dataset !== 'BINGO') {
      const options = {
        apiKey: gsApiKey,
        sheetId: gsId,
        sheetName: props.dataset,
        returnAllResults: true,
      }

      await GSheetReader(options, results => {
        tmpData = results;
      }).catch(err => {
        console.log(err);
      });
    }
    if (tmpData.length === 0) {
      tmpData = Array(75).fill({});
      for (let i = 0; i < tmpData.length; i++) {
        tmpData[i] = { "value": i + 1 };
      }
    }
    newState.data = tmpData;
    // check for saved data
    const prevSquares = localStorage.getItem(this.dataset);
    const prevGenerated = localStorage.getItem(this.dataset + "_generated");
    if (prevSquares) {
      newState.squares = JSON.parse(prevSquares);
      newState.generated = prevGenerated;
    } else {
      let squares = Array(squareCnt).fill({});
      const rndArray = randomSquares(newState.data, squareCnt);
      for (let i = 0; i < squares.length; i++) {
        squares[i] = { id: i, value: rndArray[i].value, desc: rndArray[i].desc, state: false, };
      }
      newState.squares = squares;
      newState.generated = new Date().toISOString();
    }
    newState.loading = false;
    
    this.setState(newState);
    localStorage.setItem(this.dataset, JSON.stringify(this.state.squares));
    localStorage.setItem(this.dataset + "_generated", this.state.generated);
  }

  handleClick(i) {
    let newState = this.state;
    const square = newState.squares[i];
    newState.squares[i].state = !square.state;
    this.setState(newState);
    localStorage.setItem(this.dataset, JSON.stringify(this.state.squares));
  }

  handleClear() {
    let newState = this.state;
    for (let i = 0; i < newState.squares.length; i++) {
      newState.squares[i].state = false;
    }
    this.setState(newState);
    localStorage.setItem(this.dataset, JSON.stringify(this.state.squares));
  }

  handleNew() {
    let newState = this.state;
    const rndArray = randomSquares(this.state.data, squareCnt);
    for (let i = 0; i < newState.squares.length; i++) {
      newState.squares[i].state = false;
      newState.squares[i].value = rndArray[i].value;
      newState.squares[i].desc = rndArray[i].desc;
    }
    newState.generated = new Date().toISOString();
    this.setState(newState);
    localStorage.setItem(this.dataset, JSON.stringify(this.state.squares));
    localStorage.setItem(this.dataset + "_generated", this.state.generated);
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
            <div>Card generated: {this.state.generated}</div>
          </div>
        </header>
        <div className='game-board'>
          {
            this.state.loading ?
              <Loader type='ThreeDots' color='lightskyblue' height={100} width={100} />
              :
              <Board
                squares={this.state.squares}
                onClick={(i) => this.handleClick(i)}
              />
          }
        </div>
        {
          this.dataset !== 'BINGO' && this.state.loading === false ?
            <Descriptions squares={this.state.squares} /> : ''
        }
      </div>
    );
  }
}

export default Game;
