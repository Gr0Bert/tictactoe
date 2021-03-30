import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

type SquareProps = {
    value: string,
    onClick: () => void
}

const Square: (props: SquareProps) => JSX.Element = (props: SquareProps) => {
    return (
        <button className="square" onClick={props.onClick}>
            { props.value }
        </button>
    );
}

type BoardProps = {}
type BoardState = {
    squares: Array<string>,
    xIsNext: boolean
}

class Board extends React.Component<BoardProps, BoardState> {
    constructor(props: BoardProps) {
        super(props);
        this.state = {
            squares: Array(9).fill(""),
            xIsNext: true
        }
    }

    renderSquare(i: number) {
        return <Square value={this.state.squares[i]} onClick={() => this.handleSquareClick(i)}/>;
    }

    squareValue(): string {
        return this.state.xIsNext ? "X" : "O";
    }

    handleSquareClick(i: number): void {
        const stateCopy: string[] = this.state.squares.slice()
        if (this.calculateWinner(stateCopy) || stateCopy[i] !== "") {
            return
        } else {
            stateCopy[i] = this.squareValue()
            this.setState({squares: stateCopy, xIsNext: !this.state.xIsNext})
        }
    }

    calculateWinner(squares: string[]): string | null {
        const lines = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6],
        ];
        for (let i = 0; i < lines.length; i++) {
            const [a, b, c] = lines[i];
            if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
                return squares[a];
            }
        }
        return null;
    }

    render() {
        const winner = this.calculateWinner(this.state.squares)
        const status = winner ? `Winner is ${winner}` : `Next player: ${this.squareValue()}`
        return (
            <div>
                <div className="status">{status}</div>
                <div className="board-row">
                    {this.renderSquare(0)}
                    {this.renderSquare(1)}
                    {this.renderSquare(2)}
                </div>
                <div className="board-row">
                    {this.renderSquare(3)}
                    {this.renderSquare(4)}
                    {this.renderSquare(5)}
                </div>
                <div className="board-row">
                    {this.renderSquare(6)}
                    {this.renderSquare(7)}
                    {this.renderSquare(8)}
                </div>
            </div>
        );
    }
}

class Game extends React.Component {
    render() {
        return (
            <div className="game">
                <div className="game-board">
                    <Board />
                </div>
                <div className="game-info">
                    <div>{/* status */}</div>
                    <ol>{/* TODO */}</ol>
                </div>
            </div>
        );
    }
}

// ========================================

ReactDOM.render(
    <Game />,
    document.getElementById('root')
);
