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

type BoardProps = {
    squares: Array<string>,
    onClick: (i: number) => void
}

type BoardState = {}

class Board extends React.Component<BoardProps, BoardState> {
    renderSquare(i: number) {
        return <Square value={this.props.squares[i]} onClick={() => this.props.onClick(i)}/>;
    }

    render() {
        return (
            <div>
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

type Field = {squares: Array<string>}
type GameState = {
    history: Array<Field>,
    xIsNext: boolean,
    stepNumber: number
}
type GameProps = {x: boolean}

class Game extends React.Component<GameProps, GameState> {
    constructor(props: GameProps) {
        super(props)
        this.state = {
            history: [
                {
                    squares: Array(9).fill("")
                }
            ],
            xIsNext: true,
            stepNumber: 0
        }
    }

    squareValue() {
        return this.state.xIsNext ? "X" : "O"
    }

    handleSquareClick(i: number): void {
        console.log(this.state.stepNumber)
        const historyCopy = this.state.history.slice(this.state.stepNumber)
        const stateCopy: string[] = historyCopy[0].squares.slice()
        if (this.calculateWinner(stateCopy) || stateCopy[i] !== "") {
            return
        } else {
            stateCopy[i] = this.squareValue()
            historyCopy.unshift({squares: stateCopy})
            console.log(historyCopy)
            this.setState({history: historyCopy, xIsNext: !this.state.xIsNext, stepNumber: 0})
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

    jumpTo(step: number) {
        this.setState(
            {
                stepNumber: step,
                xIsNext: (this.state.history.length - step) % 2 !== 0
            }
        )
    }

    render() {
        const currentField = this.state.history[this.state.stepNumber]
        const winner = this.calculateWinner(currentField.squares)
        const status = winner ? `Winner is ${winner}` : `Next player: ${this.squareValue()}`

        const moves = this.state.history.slice().reverse().map((step, move) => {
            const desc = move ? 'Go to move #' + move : 'Go to game start'
            const historyLength = this.state.history.length
            return (
                <li key={move}>
                    <button onClick={() => this.jumpTo((historyLength - 1) - move)}>{desc}</button>
                </li>
            )
        })

        return (
            <div className="game">
                <div className="game-board">
                    <Board onClick={(i: number) => this.handleSquareClick(i)} squares={currentField.squares} />
                </div>
                <div className="game-info">
                    <div>{status}</div>
                    <ol>{moves}</ol>
                </div>
            </div>
        );
    }
}

// ========================================

ReactDOM.render(
    <Game x={true}/>,
    document.getElementById('root')
);
