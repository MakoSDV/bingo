import React from "react";

import GSheetReader from "g-sheets-api";

import { ThreeDots } from "react-loader-spinner";

const squareCnt = 25;
const gsApiKey = "AIzaSyCG-9qmMIr-LQHGpSRZTin4hlUI-vhMhnY";
const default_gsId = "1_-k6lQkb_LIquDp5OQcKAbhq2C4q_xekPaO5W5-ywhs";

function randomInt(min, max) {
  return Math.floor(Math.random() * max + min);
}

function randomSquares(data, n) {
  let rndSet = new Set();
  let rndArray = Array(n);
  const max = data.length;
  if (max >= n) {
    while (rndSet.size < n) {
      const i = randomInt(0, max);
      if (!rndSet.has(i)) {
        const rarity = data[i].rarity ? data[i].rarity : 1;
        if (rarity >= Math.random()) {
          rndSet.add(i);
          //handle multiple exclusive options for square
          let sq = { ...data[i] }; // clone the data object
          if (typeof data[i].value === "string") {
            // ignore this for the plain Bingo with just numbers
            if (data[i].value.includes("||")) {
              let valueOptions = data[i].value.split("||");
              let optId = randomInt(0, valueOptions.length);
              sq.value = valueOptions[optId];
              if (data[i].desc && data[i].desc.includes("||")) {
                let descOptions = data[i].desc.split("||");
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
  } else {
    // handle the case where the Google Sheet doesn't have enough squares defined
    rndArray[0] = { value: "Warning:", desc: "Warning" };
    rndArray[1] = { value: "Insufficient", desc: "Insufficient" };
    rndArray[2] = { value: "Squares!", desc: "Squares!" };
    rndArray[3] = { value: "Define", desc: "Define" };
    rndArray[4] = { value: "At Least 25.", desc: "At Least 25." };
    for (let i = 5; i < n; i++) {
      rndArray[i] = { value: "...", desc: "..." };
    }
  }
  return rndArray;
}

function Square(props) {
  return (
    <button
      id={"sq" + props.id}
      className={
        "square" +
        (props.state ? " checked" : "") +
        (props.bingo ? " bingo" : "")
      }
      style={props.color ? { color: props.color } : {}}
      onClick={props.onClick}
    >
      {props.value}
    </button>
  );
}

function Board(props) {
  return props.squares.map((square) => (
    <Square
      key={square.id}
      id={square.id}
      value={square.value}
      state={square.state}
      color={square.color}
      bingo={square.bingo}
      onClick={() => props.onClick(square.id)}
    />
  ));
}

function Descriptions(props) {
  const descriptions = [];
  let squares = props.squares;
  for (let i = 0; i < squares.length; i++) {
    if (squares[i].desc) {
      if (squares[i].value.includes("||")) {
        let valueOptions = squares[i].value.split("||");
        for (let d = 0; d < valueOptions.length; d++) {
          let value = valueOptions[d];
          let desc = squares[i].desc;
          if (squares[i].desc.includes("||")) {
            let descOptions = squares[i].desc.split("||");
            if (d < descOptions.length) {
              desc = descOptions[d];
            } else {
              desc = descOptions[0]; // handle if the descriptions are too short
            }
          }
          descriptions.push({
            id: squares[i].id
              ? String(squares[i].id) + "_" + String(d)
              : String(i) + "_" + String(d),
            value: value,
            desc: desc,
            color: squares[i].color,
          });
        }
      } else {
        descriptions.push({
          id: squares[i].id ? squares[i].id : i,
          value: squares[i].value,
          desc: squares[i].desc,
          color: squares[i].color,
        });
      }
    }
  }
  descriptions.sort((a, b) => {
    if (a.value < b.value) return -1;
    if (a.value > b.value) return 1;
    return 0;
  });
  return descriptions.length > 0 ? (
    <div className="descriptions">
      <h2>Square Info:</h2>
      <ul className="descList">
        {descriptions.map((square) =>
          square.desc ? (
            <li className="desc" key={square.id}>
              <span className="descTitle">{square.value}:</span>{" "}
              <span style={square.color ? { color: square.color } : {}}>
                {square.desc}
              </span>
            </li>
          ) : (
            ""
          )
        )}
      </ul>
    </div>
  ) : (
    ""
  );
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    // handle custom title
    const title = props.title ? props.title : "BINGO";
    this.gsId = props.gsId ? props.gsId : default_gsId;
    this.dataset = props.dataset ? props.dataset : "BINGO";
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
    if (props.dataset) {
      const options = {
        apiKey: gsApiKey,
        sheetId: props.gsId ? props.gsId : default_gsId,
        sheetName: props.dataset,
        returnAllResults: true,
      };

      await GSheetReader(options, (results) => {
        tmpData = results;
      }).catch((err) => {
        console.log(err);
      });
    }
    if (tmpData.length === 0) {
      tmpData = Array(75).fill({});
      for (let i = 0; i < tmpData.length; i++) {
        tmpData[i] = { value: i + 1 };
      }
    }
    newState.data = tmpData;
    // check for saved data
    const prevSquares = localStorage.getItem(this.dataset);
    const prevGenerated = localStorage.getItem(this.dataset + "_generated");
    if (prevSquares && (prevSquares.length > 0)) {
      newState.squares = JSON.parse(prevSquares);
      newState.generated = prevGenerated;
    } else {
      let squares = Array(squareCnt).fill({});
      const rndArray = randomSquares(newState.data, squareCnt);
      for (let i = 0; i < squares.length; i++) {
        squares[i] = {
          id: i,
          value: rndArray[i].value,
          desc: rndArray[i].desc,
          state: false,
          color: rndArray[i].color,
        };
      }
      newState.squares = squares;
      newState.generated = new Date().toISOString();
    }
    newState.loading = false;

    this.setState(newState);
    localStorage.setItem(this.dataset, JSON.stringify(this.state.squares));
    localStorage.setItem(this.dataset + "_generated", this.state.generated);
  };

  checkBingo(squares, ids) {
    let cnt = 0;
    let newSquares = squares;
    // check the states
    for (let i = 0; i < ids.length; i++) {
      if (squares[ids[i]].state === true) cnt++;
    }
    if (cnt === 5) {
      // mark as a bingo
      for (let i = 0; i < ids.length; i++) {
        newSquares[ids[i]].bingo = true;
      }
    }
    return newSquares;
  }
  checkBingos(state, save = false) {
    let newState = state;
    let squares = newState.squares;
    // clear current bingo status
    for (let i = 0; i < squares.length; i++) {
      squares[i].bingo = false;
    }
    // check for bingos
    // rows
    squares = this.checkBingo(squares, [0, 1, 2, 3, 4]);
    squares = this.checkBingo(squares, [5, 6, 7, 8, 9]);
    squares = this.checkBingo(squares, [10, 11, 12, 13, 14]);
    squares = this.checkBingo(squares, [15, 16, 17, 18, 19]);
    squares = this.checkBingo(squares, [20, 21, 22, 23, 24]);
    // columns
    squares = this.checkBingo(squares, [0, 5, 10, 15, 20]);
    squares = this.checkBingo(squares, [1, 6, 11, 16, 21]);
    squares = this.checkBingo(squares, [3, 8, 13, 18, 23]);
    squares = this.checkBingo(squares, [2, 7, 12, 17, 22]);
    squares = this.checkBingo(squares, [4, 9, 14, 19, 24]);
    // diagonals
    squares = this.checkBingo(squares, [0, 6, 12, 18, 24]);
    squares = this.checkBingo(squares, [4, 8, 12, 16, 20]);
    // save
    if (save) {
      this.setState(newState);
      localStorage.setItem(this.dataset, JSON.stringify(this.state.squares));
    }
    return newState;
  }

  handleClick(i) {
    let newState = this.state;
    const square = newState.squares[i];
    newState.squares[i].state = !square.state;
    newState = this.checkBingos(newState);
    this.setState(newState);
    localStorage.setItem(this.dataset, JSON.stringify(this.state.squares));
  }

  handleClear() {
    let newState = this.state;
    for (let i = 0; i < newState.squares.length; i++) {
      newState.squares[i].state = false;
      newState.squares[i].bingo = false;
    }
    this.setState(newState);
    localStorage.setItem(this.dataset, JSON.stringify(this.state.squares));
  }

  handleNew() {
    let newState = this.state;
    const rndArray = randomSquares(this.state.data, squareCnt);
    for (let i = 0; i < newState.squares.length; i++) {
      newState.squares[i].state = false;
      newState.squares[i].bingo = false;
      newState.squares[i].value = rndArray[i].value;
      newState.squares[i].desc = rndArray[i].desc;
      newState.squares[i].color = rndArray[i].color;
    }
    newState.generated = new Date().toISOString();
    this.setState(newState);
    localStorage.setItem(this.dataset, JSON.stringify(this.state.squares));
    localStorage.setItem(this.dataset + "_generated", this.state.generated);
  }

  render() {
    return (
      <div className="game">
        <header>
          <h1 className="game-title">{this.state.title}</h1>
          <div className="game-controls">
            <button onClick={() => this.handleClear()}>Clear</button>
            <button onClick={() => this.handleNew()}>New Card</button>
            <div>Card generated: {this.state.generated}</div>
          </div>
        </header>
        <div className="game-board">
          {this.state.loading ? (
            <ThreeDots color="lightskyblue" height={100} width={100} />
          ) : (
            <Board
              squares={this.state.squares}
              onClick={(i) => this.handleClick(i)}
            />
          )}
        </div>
        {this.dataset !== "BINGO" && this.state.loading === false ? (
          <Descriptions squares={this.state.data} />
        ) : (
          ""
        )}
      </div>
    );
  }
}

export default Game;
