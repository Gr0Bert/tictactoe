import React from 'react';
import ReactDOM from 'react-dom';
import {Action, Reducer, createStore} from 'redux';
import './index.css';
import {connect, Provider, useDispatch, useSelector} from "react-redux";

enum ActionType {
    SQUARE_CLICKED = "SQUARE_CLICKED",
    STEP_CLICKED = "STEP_CLICKED"
}

interface SquareClicked extends Action<ActionType.SQUARE_CLICKED> {
    type: ActionType.SQUARE_CLICKED
    squareIndex: number
}

interface StepClicked extends Action<ActionType.STEP_CLICKED> {
    type: ActionType.STEP_CLICKED
    stepNumber: number
}

type GameAction = SquareClicked | StepClicked

type SquareState = {
    index: number
    value: string
}

type SquareProps = {
    index: number
}

const mapGameStateToSquareState = (state: GameState, index: number) => {
    const step = state.stepNumber
    const newValue = state.history[step].squares[index]
    return {
        index: index,
        value: newValue
    } as SquareState
}

const squareToggled = (i: number) => {
    return {
        type: ActionType.SQUARE_CLICKED,
        squareIndex: i
    } as SquareClicked
}

function Square({index}: SquareProps) {
    const state = useSelector<GameState, SquareState>(state => mapGameStateToSquareState(state, index))
    const dispatch = useDispatch()

    return (
        <button className="square" onClick={ () => dispatch(squareToggled(index))}>
            { state.value }
        </button>
    );
}

function Board() {
    function renderSquare(i: number) {
        return <Square index={i} />;
    }

    return (
        <div>
            <div className="board-row">
                {renderSquare(0)}
                {renderSquare(1)}
                {renderSquare(2)}
            </div>
            <div className="board-row">
                {renderSquare(3)}
                {renderSquare(4)}
                {renderSquare(5)}
            </div>
            <div className="board-row">
                {renderSquare(6)}
                {renderSquare(7)}
                {renderSquare(8)}
            </div>
        </div>
    )
}

const BoardConnected = connect()(Board)

type Field = {squares: Array<string>}

type GameState = {
    history: Array<Field>,
    xIsNext: boolean,
    stepNumber: number
}

const calculateWinner = (squares: string[]): string | null => {
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

const jumpTo = (stepNumber: number): StepClicked => {
    return {
        type: ActionType.STEP_CLICKED,
        stepNumber: stepNumber
    } as StepClicked
}

function Game() {
    const state = useSelector<GameState, GameState>(state => state)
    const dispatch = useDispatch()

    const currentField = state.history[state.stepNumber]
    const winner = calculateWinner(currentField.squares)
    const status = winner ? `Winner is ${winner}` : `Next player: ${state.xIsNext ? "X" : "O"}`

    const moves = state.history.slice().reverse().map((step, move) => {
        const desc = move ? 'Go to move #' + move : 'Go to game start'
        const historyLength = state.history.length
        const jumpStep = historyLength - 1 - move
        return (
            <li key={move}>
                <button onClick={() => dispatch(jumpTo(jumpStep))}>{desc}</button>
            </li>
        )
    })

    return (
        <div className="game">
            <div className="game-board">
                <BoardConnected />
            </div>
            <div className="game-info">
                <div>{status}</div>
                <ol>{moves}</ol>
            </div>
        </div>
    );
}


const InitialGameState = {
    history: [
        {
            squares: Array(9).fill("")
        }
    ],
    xIsNext: true,
    stepNumber: 0
}
// ========================================

const gameReducer: Reducer<GameState, GameAction> = (state: GameState | undefined, action: GameAction): GameState => {
    const stateOrInitial = state ? state : InitialGameState
    switch (action.type) {
        case ActionType.SQUARE_CLICKED:
            const historyCopy = stateOrInitial.history.slice(stateOrInitial.stepNumber)
            const stateCopy: string[] = historyCopy[0].squares.slice()
            if (calculateWinner(stateCopy) || stateCopy[action.squareIndex] !== "") {
                return stateOrInitial
            } else {
                stateCopy[action.squareIndex] = stateOrInitial.xIsNext ? "X" : "O"
                historyCopy.unshift({squares: stateCopy})
                return {
                    history: historyCopy,
                    xIsNext: !stateOrInitial.xIsNext,
                    stepNumber: 0
                }
            }

        case ActionType.STEP_CLICKED:
            return {
                ...stateOrInitial,
                stepNumber: action.stepNumber,
                xIsNext: (stateOrInitial.history.length - action.stepNumber) % 2 !== 0
            }

        default: return InitialGameState
    }
}

const store: any = createStore<GameState, GameAction, any, any>(
    gameReducer,
    InitialGameState,
    (window as any).__REDUX_DEVTOOLS_EXTENSION__ && (window as any).__REDUX_DEVTOOLS_EXTENSION__()
)

ReactDOM.render(
    <Provider store={store}>
        <Game />
    </Provider>,
    document.getElementById('root')
);
