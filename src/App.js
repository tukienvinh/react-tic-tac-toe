import React from 'react';
import './App.css';

function Square(props) {
  return props.isBold === true ? 
  (
    <button className="square" onClick={props.onClick}>
      <strong style={{color:'green'}}>{props.value}</strong>
    </button>
  ) : (
    <button className="square" onClick={props.onClick}>
      {props.value}
    </button>
  )
}

class Board extends React.Component {
  renderSquare(i,j) {
    var isBold = false;
    if (this.props.winList !== null) {
      for (let k = 0; k < this.props.winList.length; k++) {
        if (this.props.winList[k][0] === i && this.props.winList[k][1] === j)
          isBold = true;
      }
    }
    return (
      <Square
        value={this.props.squares[i][j]}
        isBold={isBold}
        onClick={() => this.props.onClick(i,j)}
      />
    )
  }

  render() {
    return (
      <div>
        {this.props.squares.map((row, rowIdx) => (
          <div className="board-row">
            {row.map((col, colIdx) => (
              this.renderSquare(rowIdx, colIdx)
            ))}
          </div>
        ))}
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [
        {
          squares: Array(10).fill(null).map(() => Array(10).fill(null))
        }
      ],
      stepNumber: 0,
      xIsNext: true,
      isAscending: true
    }
  }

  handleClick(i,j) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (calculateWinner(squares) || squares[i][j]) {
      return;
    }
    squares[i][j] = this.state.xIsNext ? "X" : "O";
    this.setState({
      history: history.concat([
        {
          squares: squares,
          row: i,
          col: j
        }
      ]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0
    });
  }

  sortHistory() {
    this.setState({
      isAscending: !this.state.isAscending
    });
  }

  checkDraw(squares) {
    for (let i = 0; i < 10; i++)
      for (let j = 0; j < 10; j++) {
        if (squares[i][j] === null)
          return false;
      }
    return true;
  }

  render() {
    var history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);
    if (!this.state.isAscending)
      history = history.reverse();
      const moves = history.map((step, move) => {
      var desc;
      if (this.state.isAscending) {
        desc = move ?
        'Go to move #' + move + ": current position (" + history[move].col + "," + history[move].row + ")" :
        'Go to game start';
      }
      else {
        desc = (move !== history.length - 1) ?
        'Go to move #' + move + ": current position (" + history[move].col + "," + history[move].row + ")" :
        'Go to game start';
      }
      return (
        this.state.isAscending ? (
        move === this.state.stepNumber ? (
          <li key={move}>
            <button onClick={() => this.jumpTo(move)}><strong>{desc}</strong></button>
          </li>
        )
        : (
          <li key={move}>
            <button onClick={() => this.jumpTo(move)}>{desc}</button>
          </li>
          )
        ) : (
          move === history.length - 1 - this.state.stepNumber ? (
            <li key={move}>
              <button onClick={() => this.jumpTo(move)}><strong>{desc}</strong></button>
            </li>
          )
          : (
            <li key={move}>
              <button onClick={() => this.jumpTo(move)}>{desc}</button>
            </li>
          )
        )
      )
      }
    );
    
    let status;
    if (winner) {
      status = "Winner: " + winner.winner;
    } else {
      if (this.checkDraw(current.squares))
        status = "Draw";
      else status = "Next player: " + (this.state.xIsNext ? "X" : "O");
    }

    return (
      <div className="game">
        <div className="game-board">
          {winner ? (
            <Board
            squares={current.squares}
            winList={winner.winList}
            onClick={(i,j) => this.handleClick(i,j)}
          />
          ) : (
            <Board
            squares={current.squares}
            winList={null}
            onClick={(i,j) => this.handleClick(i,j)}
          />
          )}
        </div>
        <div className="game-info">
          <div>{status}</div>
          <ol>{moves}</ol>
          <div>
          {this.state.isAscending ? (<button onClick={() => this.sortHistory()}>Ascending</button>) : (<button onClick={() => this.sortHistory()}>Descending</button>)}
          </div>
        </div>
      </div>
    );
  }
}

// ========================================
function App() {
  return ( <Game/> );
}

function checkWinByColumn(squares, i, j) {
  let count = 0, col = i, winList = [];
  while (squares[col][j] === squares[i][j]) {
    count++;
    winList.push([col,j]);
    col++;
    if (col >= 10)
      break;
  }
  col = i - 1;
  if (col >= 0) {
    while (squares[col][j] === squares[i][j]) {
      count++;
      winList.push([col,j]);
      col--;
      if (col < 0)
        break;
    }
  }
  if (count === 5) {
    return {
      winner: squares[i][j],
      winList
    };
  }
  return null;
}

function checkWinByRow(squares, i, j) {
  let count = 0, row = j, winList = [];
  while (squares[i][row] === squares[i][j]) {
    count++;
    winList.push([i,row]);
    row++;
    if (row >= 10)
      break;
  }
  row = j - 1;
  if (row >= 0) {
    while (squares[i][row] === squares[i][j]) {
      count++;
      winList.push([i,row]);
      row--;
      if (row < 0)
        break;
    }
  }
  if (count === 5) 
    return {
      winner: squares[i][j],
      winList
    }
  return null;
}

function checkWinByFirstDiagonal(squares, i, j) {
  let count = 0, row = i, col = j, winList = [];
  while (squares[i][j] === squares[row][col]) {
    count++;
    winList.push([row,col]);
    row++;
    col++;
    if (row >= 10 || col >= 10)
      break;
  }
  row = i - 1;
  col = j - 1;
  if (row >= 0 && col >= 0) {
    while (squares[i][j] === squares[row][col]) {
      count++;
      winList.push([row,col]);
      row--;
      col--;
      if (row < 0 || col < 0)
        break;
    }
  }
  if (count === 5)
    return {
      winner: squares[i][j],
      winList
    }
  return null;
}

function checkWinBySecondDiagonal(squares, i, j) {
  let count = 0, row = i, col = j, winList = [];
  while (squares[i][j] === squares[row][col]) {
    count++;
    winList.push([row,col]);
    row++;
    col--;
    if (row >= 10 || col < 0)
      break;
  }
  row = i - 1;
  col = j + 1;
  if (row >= 0 && col < 10) {
    while (squares[i][j] === squares[row][col]) {
      count++;
      winList.push([row,col]);
      row--;
      col++;
      if (row < 0 || col >= 0)
        break;
    }
  }
  if (count === 5)
    return {
      winner: squares[i][j],
      winList
    }
  return null;
}

function calculateWinner(squares) {
  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
      if (squares[i][j] !== null) {
        // check column
        if (checkWinByColumn(squares, i, j) !== null)
          return checkWinByColumn(squares, i, j);
        
        // check row
        if (checkWinByRow(squares, i, j) !== null)
          return checkWinByRow(squares, i, j);

        // check first diagonal
        if (checkWinByFirstDiagonal(squares, i, j) !== null)
          return checkWinByFirstDiagonal(squares, i, j);

        // check second diagonal
        if (checkWinBySecondDiagonal(squares, i, j) !== null)
          return checkWinBySecondDiagonal(squares, i, j);
      }
    }
    
  }
  return null;
}

export default App;
