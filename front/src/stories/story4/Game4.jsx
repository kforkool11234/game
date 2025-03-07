import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import bg from './../../assets/story4bg.png';
import letterOpener from './../../assets/letterOpener.png';
import painting from './../../assets/painting.png';
import candlestick from './../../assets/candlestick.png';
import Mask from './../../assets/mask.png';
import diary from './../../assets/diary.png';

// Mapping for items to be found
const itemsMapping = {
  item1: "The Letter Opener",
  item2: "The Painting",
  item3: "The Candlestick",
  item4: "The Mask",
  item5: "The Diary"
};

// Define positions and sizes for each clickable item
const clickableStyles = {
  item1: { top: "80%", left: "58%", width: "80px", height: "80px" },
  item2: { top: "10%", left: "14%", width: "100px", height: "100px" },
  item3: { top: "50%", right: "70%", width: "120px", height: "220px" },
  item4: { top: "65%", right: "22%", width: "90px", height: "90px" },
  item5: { top: "75%", left: "35%", width: "220px", height: "120px" }
};

const Story4 = () => {
  const [timeLeft, setTimeLeft] = useState(300);
  const [points, setPoints] = useState(0);
  const [clickedItems, setClickedItems] = useState([]);
  const [inventory, setInventory] = useState([]);
  const navigate = useNavigate();

  // Start game when component mounts
  useEffect(() => {
    const startGame = async () => {
      try {
        const response = await axios.post("http://localhost:5000/start-game");
        setTimeLeft(response.data.timeLeft);
        setPoints(response.data.points);
      } catch (error) {
        console.error("Error starting game", error);
      }
    };
    startGame();
  }, []);
  if (timeLeft === 0|| inventory.length==5) {
    const teamname=localStorage.getItem("teamName")
    navigate(`/Points/:${teamname}`);
  }
  // Poll the backend every second to update time left and points
  useEffect(() => {
    const fetchGameStatus = async () => {
      try {
        const response = await axios.get("http://localhost:5000/game-status");
        setTimeLeft(response.data.timeLeft);
        setPoints(response.data.points);
        if (response.data.timeLeft <= 0|| inventory.length==5) {
          
          navigate('/Leaderboard');
        }
      } catch (error) {
        console.error("Error fetching game status", error);
      }
    };

    const interval = setInterval(fetchGameStatus, 1000);
    return () => clearInterval(interval);
  }, [inventory,navigate]);

  // Fetch the inventory from the backend
  const fetchInventory = async () => {
    try {
      const response = await axios.get("http://localhost:5000/items");
      setInventory(response.data.items);
    } catch (error) {
      console.error("Error fetching inventory", error);
    }
  };

  // Get inventory on mount and whenever items are updated
  useEffect(() => {
    fetchInventory();
  }, []);

  // Handle a click on a game item
  const handleClick = async (item) => {
    if (!clickedItems.includes(item)) {
      try {
        const payload = {
          name: itemsMapping[item],
          description: `Found ${itemsMapping[item]} in Story 4`,
          foundBy: "Player"
        };
        await axios.post("http://localhost:5000/items", payload);
        setClickedItems(prev => [...prev, item]);
        setPoints(prevPoints => prevPoints + 10); // Increment points locally
        fetchInventory();
      } catch (error) {
        console.error("Error posting item", error);
      }
    }
  };

  // Helper to format the remaining time as mm:ss
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="min-h-screen relative bg-black text-white">
      {/* Timer and Points Display */}
      <div className="absolute top-2 left-2 bg-black bg-opacity-50 p-2 rounded">
        <p>Time Left: {formatTime(timeLeft)}</p>
        <p>Points: {points}</p>
      </div>

      {/* Inventory Display (Found Items) */}
      <div className="absolute top-2 right-2 bg-black bg-opacity-50 p-2 rounded">
        <h4>Inventory (Found Items):</h4>
        <ul>
          {inventory.length > 0 ? (
            inventory.map((item, index) => (
              <li key={index}>{item.name}</li>
            ))
          ) : (
            <li>None</li>
          )}
        </ul>
      </div>

      {/* Items to Find List */}
      <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 p-2 rounded">
        <h4>Items to Find:</h4>
        <ul>
          {Object.keys(itemsMapping).map(key => (
            <li
              key={key}
              style={{
                textDecoration: clickedItems.includes(key) ? 'line-through' : 'none'
              }}
            >
              {itemsMapping[key]}
            </li>
          ))}
        </ul>
      </div>

      {/* Background with Clickable Areas */}
      <div
        className="relative mx-auto"
        style={{
          width: "900px",
          height: "650px",
          backgroundImage: `url(${bg})`,
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center"
        }}
      >
        {Object.keys(itemsMapping).map(item => (
          !clickedItems.includes(item) && (
            <div
              key={item}
              onClick={() => handleClick(item)}
              style={{
                position: "absolute",
                ...clickableStyles[item]
              }}
            >
              
            </div>
          )
        ))}
      </div>
    </div>
  );
};

export default Story4;
