import React from 'react';
import ReactDOM from 'react-dom';
import {Action, Reducer, createStore} from 'redux';
import './index.css';
import {connect, ConnectedProps, Provider} from "react-redux";

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

type GameEvent = SquareClicked | StepClicked

const InitialGameState = {
    history: [
        {
            squares: Array(9).fill("")
        }
    ],
    xIsNext: true,
    stepNumber: 0
}

type SquareProps = {
    index: number
    value: string
}

const mapStateToPropsSquare = (state: GameState, ownProps: SquareProps) => {
    const step = state.stepNumber
    const newValue = state.history[step].squares[ownProps.index]
    return {
        index: ownProps.index,
        value: newValue
    } as SquareProps
}

const squareToggled = (i: number) => {
    return {
        type: ActionType.SQUARE_CLICKED,
        squareIndex: i
    } as SquareClicked
}

const mapDispatchToPropsSquare = {
        squareToggledAction: squareToggled
    }

const squareComponentConnector = connect(mapStateToPropsSquare, mapDispatchToPropsSquare);

type SquareComponentType = ConnectedProps<typeof squareComponentConnector>

class Square extends React.Component<SquareComponentType, {}> {
    render() {
        return (
            <button className="square" onClick={ () => this.props.squareToggledAction(this.props.index) }>
                { this.props.value }
            </button>
        );
    }
}

const SquareConnected = squareComponentConnector(Square)

class Board extends React.Component<{}, {}> {
    renderSquare(index: number) {
        return <SquareConnected index={index} value={""} />;
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
        )
    }
}

const BoardConnected = connect()(Board)

type Field = {squares: Array<string>}

type GameState = {
    history: Array<Field>,
    xIsNext: boolean,
    stepNumber: number
}

type GameProps = GameState

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

const mapStateToPropsGame = (state: GameState, ownProps: GameProps) => {
    return state
}

const jumpTo = (stepNumber: number) => {
    return {
        type: ActionType.STEP_CLICKED,
        stepNumber: stepNumber
    } as StepClicked
}

const mapDispatchToPropsGame = {
    jumpToAction: jumpTo
}

const gameComponentConnector = connect(mapStateToPropsGame, mapDispatchToPropsGame);

type GameComponentType = ConnectedProps<typeof gameComponentConnector>

class Game extends React.Component<GameComponentType, {}> {
    render() {
        const currentField = this.props.history[this.props.stepNumber]
        const winner = calculateWinner(currentField.squares)
        const status = winner ? `Winner is ${winner}` : `Next player: ${this.props.xIsNext ? "X" : "O"}`

        const moves = this.props.history.slice().reverse().map((step, move) => {
            const desc = move ? 'Go to move #' + move : 'Go to game start'
            const historyLength = this.props.history.length
            const jumpStep = historyLength - 1 - move
            return (
                <li key={move}>
                    <button onClick={() => this.props.jumpToAction(jumpStep)}>{desc}</button>
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
}

const GameConnected = gameComponentConnector(Game)

// ========================================

const gameReducer: Reducer<GameState, GameEvent> = (state: GameState | undefined, action: GameEvent): GameState => {
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

const store: any = createStore<GameState, GameEvent, any, any>(
    gameReducer,
    InitialGameState,
    (window as any).__REDUX_DEVTOOLS_EXTENSION__ && (window as any).__REDUX_DEVTOOLS_EXTENSION__()
)

ReactDOM.render(
    <Provider store={store}>
        <GameConnected
            history={InitialGameState.history}
            stepNumber={InitialGameState.stepNumber}
            xIsNext={InitialGameState.xIsNext}
        />
    </Provider>,
    document.getElementById('root')
);
