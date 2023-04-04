import './App.css';
import {Row} from './Row.js';
import React from 'react';
import wordList from './wordList.txt';
import {RowStat} from './RowStat.js';
import {getColors} from './helperFunctions.js';
import InfoTheoryWorld from './InfoTheoryWorld.js';
import {SolverInAction} from './SolverInAction.js';

// let infoTheoryData = infoTheoryDataStructure();
export let infoTheoryDataStructure;

function App() {

  const [word, setWord] = React.useState(null);
  const [lengthz, setLengthz] = React.useState(null);
  const [currentRow, setCurrentRow] = React.useState(null);
  const [guesses, setGuesses] = React.useState(null);
  const [mode, setMode] = React.useState(null);
  const [guess, setGuess] = React.useState(null);
  const [botActive, setBotActive] = React.useState(null);
  const [botWindow, setBotWindow] = React.useState(null);

  const resetGame = () => {
    fetch(wordList)
    .then(response => response.text())
    .then(text=> text.split(/\r?\t|\n/))
    .then(res=>{
      let randomIndex = Math.floor(Math.random() * res.length);
      setMode('gaming');
      setWord(res[randomIndex]);
      setLengthz(5);
      setCurrentRow(0);
      setGuess('');
      let blankGuessList = new Array(6).fill(null).map(()=>({guessWord: null, guessColors: new Array(5).fill('beige'), guessStats: null}));
      setGuesses(blankGuessList);
      infoTheoryDataStructure = new InfoTheoryWorld(res);
      setBotActive(false);
      setBotWindow(0);
    })
  }
  React.useEffect(()=> {
    resetGame();
  }, []);

  React.useEffect(()=> {
    if (botActive) {
      setBotWindow(a=>a+1)
    } else {
      setBotWindow(0)
    }
  }, [botActive]);

  if (!guesses) {
    return <div>loading...</div>
  }

  const addGuessColorsAndSetGuesses = (guess1) => {
    let temp = [...guesses];
    let tempBotActive = false;
    if (botActive) {
      setBotWindow(0);
      tempBotActive = true;
    }

    //right here is where, if AI is playing, it should get optimal guess and display visuals and return GUESS for use in line below.
    let colors = getColors(word, guess1);
    let stats = {
      wordCountBefore: infoTheoryDataStructure.wordSpace.length,
      entropy: infoTheoryDataStructure.checkGuess(guess1)
    };
    infoTheoryDataStructure.trimWordSpace(colors, guess1);
    stats.wordCountAfter = infoTheoryDataStructure.wordSpace.length;

    temp[currentRow] = {guessWord: guess1, guessColors: colors, guessStats: stats, bot:botActive? true: false};
    setGuesses(temp);
    if (guess1 === word) {
      setMode('won');
    } else if (currentRow === 5) {
      setMode('lost');
    } else {
      setCurrentRow(a=>a+1);
      setGuess('');
      if (tempBotActive) {
        setTimeout(()=> {
          setBotWindow(a=>a+1);
        }, 2500);
      }
    }
  }

  const classLabelForColoring = () => (botActive ? 'orange' : 'blue');

  return (
    <div id ="outerOuter">
      <div id="leftColumn">
        <div id="buttonContainer">
          {mode === 'gaming' && <button className={classLabelForColoring()} onClick={()=>{setBotActive(a=>!a)}}>Turn {botActive ? 'Off': 'On'} Bot</button>}
        </div>
        <div id="board">
          {guesses.map((item, index)=> (
            <Row key={index} word={word} guess={item}></Row>
          ))}
        </div>
        {mode === 'gaming' && <div>
        <input type="text" maxLength={lengthz} placeholder="enter guess" onChange={((e)=>{setGuess(e.target.value)})} value={guess}></input>
        <input type="submit" disabled={guess.length < lengthz} onClick={()=>addGuessColorsAndSetGuesses(guess)}></input>
        </div>}
        {mode==='won' && <div>Won in {currentRow + 1} tries!
          <button onClick={resetGame}>Play Again</button>
        </div>}
        {mode==='lost' && <div>Lost! The answer was {word}
          <button onClick={resetGame}>Play Again</button>
        </div>}
        {/* <span>Answer: {word}</span> */}
      </div>

      <div id="statsANDwindow" >
        <table id="statsboard">
          <thead>
            <tr>
              <th>Possibilities</th>
              <th>Uncertainty (bits)</th>
              <th>Guess's Expected Gain (bits)</th>
              <th>Guess's Actual Gain (bits)</th>
            </tr>
          </thead>
          <tbody>
            {guesses.filter((item)=>(item.guessStats !== null)).map((item, index)=> (
              <RowStat guessStats={item.guessStats} key={index} bot={item.bot}></RowStat>
            ))}
          </tbody>
        </table>
      </div>
      {botWindow > 0 && <SolverInAction botWindow={botWindow} addGuessColorsAndSetGuesses={addGuessColorsAndSetGuesses} infoTheoryDataStructure={infoTheoryDataStructure} topX={10} timeEach={Math.min(Math.floor(6000 / infoTheoryDataStructure.wordSpace.length), 500)}></SolverInAction>}

    </div>
  );
}

export default App;
