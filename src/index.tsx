import React from 'react';
import ReactDOM from 'react-dom';
import {createStore, Reducer} from 'redux';
import './index.css';
import {Provider, useDispatch, useSelector} from "react-redux";

interface GameAction<S> {
    type: "GAME_ACTION"
    changeState: ChangeState<S>
}

type ChangeState<S> = (state: S) => S

type SquareState = {value: string, isXNext: boolean}

type SquareProps = {
    value: string
    dispatcher: GameDispatcher<SquareState>
}

const squareToggled = (): ChangeState<SquareState> => {
    return (state) => {
        return {
            value: state.isXNext ? "X" : "O",
            isXNext: !state.isXNext
        }
    }
}

function Square({value, dispatcher}: SquareProps) {
    return (
        <button className="square" onClick={ () => dispatcher.dispatch(squareToggled())}>
            { value }
        </button>
    );
}


type BoardProps = {
    board: Field,
    dispatcher: GameDispatcher<GameState>
}

function Board({board, dispatcher}: BoardProps) {
    function squareDispatcher(index: number): GameDispatcher<SquareState> {
        return fromParentDispatcher<GameState, SquareState>(
            dispatcher,
            (arg0) => {
                return {
                    value: arg0.history[0].squares[index],
                    isXNext: arg0.xIsNext
                }
            },
            (arg0, arg1) => {
                const historyCopy = arg0.history.slice(arg0.stepNumber)
                const boardCopy: string[] = historyCopy[0].squares.slice()
                if (calculateWinner(boardCopy) || boardCopy[index] !== "") {
                    return arg0
                } else {
                    boardCopy[index] = arg1.value
                    historyCopy.unshift({squares: boardCopy})
                    return {
                        ...arg0,
                        history: historyCopy,
                        xIsNext: arg1.isXNext,
                        stepNumber: 0
                    }
                }
            }
        )
    }


    function renderSquare(i: number, value: string) {
        return <Square value={value} dispatcher={squareDispatcher(i)} />;
    }

    return (
        <div>
            <div className="board-row">
                {renderSquare(0, board.squares[0])}
                {renderSquare(1, board.squares[1])}
                {renderSquare(2, board.squares[2])}
            </div>
            <div className="board-row">
                {renderSquare(3, board.squares[3])}
                {renderSquare(4, board.squares[4])}
                {renderSquare(5, board.squares[5])}
            </div>
            <div className="board-row">
                {renderSquare(6, board.squares[6])}
                {renderSquare(7, board.squares[7])}
                {renderSquare(8, board.squares[8])}
            </div>
        </div>
    )
}

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

const jumpTo = (stepNumber: number): ChangeState<GameState> => {
    return (state: GameState) => {
        return {
            ...state,
            stepNumber: stepNumber,
            xIsNext: (state.history.length - stepNumber) % 2 !== 0
        }
    }
}

type GameProps = {
    state: GameState
    dispatcher: GameDispatcher<GameState>
}

function Game(props: GameProps) {
    const state = props.state
    const boardDispatcher = props.dispatcher

    const currentField = state.history[state.stepNumber]
    const winner = calculateWinner(currentField.squares)
    const status = winner ? `Winner is ${winner}` : `Next player: ${state.xIsNext ? "X" : "O"}`

    const moves = state.history.slice().reverse().map((step, move) => {
        const desc = move ? 'Go to move #' + move : 'Go to game start'
        const historyLength = state.history.length
        const jumpStep = historyLength - 1 - move
        return (
            <li key={move}>
                <button onClick={() => props.dispatcher.dispatch(jumpTo(jumpStep))}>{desc}</button>
            </li>
        )
    })

    return (
        <div className="game">
            <div className="game-board">
                <Board board={currentField} dispatcher={boardDispatcher} />
            </div>
            <div className="game-info">
                <div>{status}</div>
                <ol>{moves}</ol>
            </div>
        </div>
    );
}

// ideally should be a method on GameDispatcher
function fromParentDispatcher<S, S1>(parentDispatcher: GameDispatcher<S>, get: (arg0: S) => S1, set: (arg0: S, arg1: S1) => S): GameDispatcher<S1> {
    const next = {} as GameDispatcher<S1>
    next.dispatch = (modify: (arg0: S1) => S1): void => {
        const newDispatch =  (state: S) => set(state, modify(get(state)))
        parentDispatcher.dispatch(newDispatch)
    }
    return next
}

interface GameDispatcher<S> {
    dispatch(modify: ChangeState<S>): void
}

function makeRootDispatcher<S>(reduxDispatcher: (arg0: any) => void): GameDispatcher<S> {
    const root = {} as GameDispatcher<S>
    root.dispatch = (modify: (arg0: S) => S): void => {
        reduxDispatcher({
            type: "GAME_ACTION",
            changeState: (state: S) => modify(state)
        })
    }
    return root
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

const gameStates = Array(5).fill(InitialGameState)

const gameReducer: Reducer<Array<GameState>, GameAction<Array<GameState>>> = (state: Array<GameState> | undefined, action: GameAction<Array<GameState>>): Array<GameState> => {
    const stateOrInitial = state ? state : gameStates
    switch (action.type) {
        case "GAME_ACTION": return action.changeState(stateOrInitial)

        default: return gameStates
    }
}

const store: any = createStore<Array<GameState>, GameAction<Array<GameState>>, any, any>(
    gameReducer,
    (window as any).__REDUX_DEVTOOLS_EXTENSION__ && (window as any).__REDUX_DEVTOOLS_EXTENSION__()
)


const Root = () => {
    const reduxDispatcher = useDispatch()
    const state: Array<GameState> = useSelector<Array<GameState>, Array<GameState>>(state => state)
    const rootDispatcher = makeRootDispatcher<Array<GameState>>(reduxDispatcher)
    const games = state.map((gameState, gameIndex) => {
        const gameDispatcher = makeGameDispatcher(rootDispatcher, gameIndex)
        return <Game state={gameState} dispatcher={gameDispatcher}/>
    })
    return (
        <div>
            {games}
        </div>)
}

const makeGameDispatcher = (rootDispatcher: GameDispatcher<Array<GameState>>, gameIndex: number) => {
    return fromParentDispatcher<Array<GameState>, GameState>(
        rootDispatcher,
        (arg0) => { return arg0[gameIndex] },
            (arg0, arg1) => {
                const stateCopy = arg0.slice()
                stateCopy[gameIndex] = arg1
                return stateCopy
            }
        )
}

ReactDOM.render(
    <Provider store={store}>
        <Root />
    </Provider>,
    document.getElementById('root')
);
