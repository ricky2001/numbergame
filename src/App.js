import React, { useState, useEffect } from 'react';
import './App.css';
import Swal from 'sweetalert2';
import img1 from './picture/Congratulations.jpg';

const RECORDS_STORAGE_KEY = 'fifteen_puzzle_records';

const generateBoard = () => {
  const board = Array.from({ length: 16 }, (_, index) => index + 1);
  board[15] = null; // Empty tile
  return shuffleArray(board);
};

const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const countInversions = (arr) => {
  let inversions = 0;
  for (let i = 0; i < arr.length - 1; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] && arr[j] && arr[i] > arr[j]) {
        inversions++;
      }
    }
  }
  return inversions;
};

const isSolvable = (board) => {
  const inversions = countInversions(board);
  const emptyTileRowFromBottom = Math.floor(board.indexOf(null) / 4) + 1;

  if (board.length % 2 === 0) {
    return (inversions + emptyTileRowFromBottom) % 2 === 0;
  }

  return inversions % 2 === 0;
};

const App = () => {
  const [name, setName] = useState('');
  const [board, setBoard] = useState(generateBoard());
  const [timer, setTimer] = useState(0);
  const [running, setRunning] = useState(false);
  const [records, setRecords] = useState([]);

  useEffect(() => {
    const storedRecords = JSON.parse(localStorage.getItem(RECORDS_STORAGE_KEY)) || [];
    setRecords(storedRecords);
  }, []);

  useEffect(() => {
    let interval;

    if (running) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer + 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [running]);

  const handleStart = () => {
    if (name.trim() === '') {
      Swal.fire({
        title: "Have you fill name?",
        text: "Please fill your name.",
        icon: "question",
        confirmButtonText: "Close",
        confirmButtonColor: "#B82000"
      });
      return;
    }

    let newBoard;
    do {
      newBoard = generateBoard();
    } while (!isSolvable(newBoard));

    setBoard(newBoard);
    setRunning(true);
  };

  const handleTileClick = (index) => {
    if (!running) {
      return;
    }

    const emptyIndex = board.indexOf(null);
    const row = Math.floor(index / 4);
    const col = index % 4;
    const emptyRow = Math.floor(emptyIndex / 4);
    const emptyCol = emptyIndex % 4;

    if (
      (row === emptyRow && Math.abs(col - emptyCol) === 1) ||
      (col === emptyCol && Math.abs(row - emptyRow) === 1)
    ) {
      const newBoard = [...board];
      [newBoard[index], newBoard[emptyIndex]] = [newBoard[emptyIndex], newBoard[index]];

      setBoard(newBoard);

      if (newBoard.every((tile, i) => tile === null || tile === i + 1)) {
        setRunning(false);
        handleRecord();
        Swal.fire({
          title: `Congratulations, ${name}!`,
          text: `You won in ${timer} seconds.`,
          imageUrl: img1,
          imageWidth: 400,
          imageHeight: 200,
          imageAlt: "Custom image",
          confirmButtonText: "Close",
        confirmButtonColor: "#B82000"
        });
        setName('');
      }
    }
  };

  const handleRecord = () => {
    const newRecords = [...records, { name, time: timer }];
    setRecords(newRecords);
    localStorage.setItem(RECORDS_STORAGE_KEY, JSON.stringify(newRecords));
  };

  const handleClearRecords = () => {
    setRecords([]);
    localStorage.removeItem(RECORDS_STORAGE_KEY);
  };

  return (
    <div className="App">
      {!running ? (
        <div>
          <label>
            Name:
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <button onClick={handleStart}>Start</button>
        </div>
      ) : (
        <div>
          <div className="board">
            {board.map((tile, index) => (
              <div key={index} onClick={() => handleTileClick(index)}>
                {tile !== null ? tile : ''}
              </div>
            ))}
          </div>
          <div>
            <p>Timer: {timer}s</p>
            <button onClick={() => setRunning(false)+setName('')+setTimer(0)}>End Game</button>
          </div>
        </div>
      )}

      <div><br/>
        <h2>Ranking</h2>
        <ul>
          
          {records.map((record, index) => (
             <li key={index}>{`NO.${index + 1}. ${record.name}: ${record.time}s`}</li>
          ))}
        </ul><button className="clear-records" onClick={handleClearRecords}>Clear Records</button>
      </div>
    </div>
  );
};

export default App;
