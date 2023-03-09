import React, { useCallback, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import './App.css';
import CurrentUserHeader from "./Components/CurrentUserHeader";
import TelereadButton from "./Components/TelereadButton";
import Telereader from "./Components/Telereader";
import WebsocketConnector from "./Components/WebsocketConnector";


function App() {
  const [ws, setWs] = useState();
  const [userId, setUserId] = useState();
  const [isConnected, setIsConnected] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [chars, setChars] = useState([]);
  const [showCursor, setShowCursor] = useState(true)

  const connectToWs = (event) => {
    event.preventDefault();
    const wsUrl = event.target.elements.formWebsocketUrl.value;
    if (wsUrl) {
      const newWebsocket = new WebSocket(wsUrl, userId);

      setWs(newWebsocket);
      newWebsocket.onerror = () => {
        console.log('Error occured in WebSocket connection. Terminating...')
        setIsConnected(false);
      }

      newWebsocket.onopen = () => {
        console.log('WebSocket connection opened');
        setIsConnected(true);
      };

      newWebsocket.onmessage = (event) => {
        console.log('Message received:', event.data);
        const msg = event.data;
        setChars(prevChars => [...prevChars, msg]);
      };

      newWebsocket.onclose = () => {
        console.log('WebSocket connection closed');
        setIsConnected(false);
        setIsReading(false);
      };
    }
  }

  useEffect(() => {
    const storedUserId = sessionStorage.getItem("userId");
    if (!storedUserId) {
      const randomId = uuidv4();
      sessionStorage.setItem("userId", randomId);
      setUserId(randomId);
    } else {
      setUserId(storedUserId);
    }
  }, []);

  const onReadClick = useCallback(
    () => {
      setIsReading(true);
      ws.send(JSON.stringify({ action: "teleprinter" }));
    }, [ws]
  );

  const onDisconnectClick = () => {
    if (isConnected) {
      ws.close();
    }
  };

  const onClearClick = () => {
    setChars([]);
  }

  const onResetIdentityClick = () => {
    const randomId = uuidv4();
    sessionStorage.setItem("userId", randomId);
    setUserId(randomId);

    onDisconnectClick();
    onClearClick();
  }

  useEffect(() => {
    const intervalId = setInterval(() => {
      setShowCursor(prevValue => !prevValue);
    }, 500);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div>
      <CurrentUserHeader userId={userId} onResetIdentityClick={onResetIdentityClick} />
      <WebsocketConnector
        isConnected={isConnected}
        connectToWs={connectToWs}
        onDisconnectClick={onDisconnectClick}
        onResetIdentityClick={onResetIdentityClick}
      />
      <TelereadButton isConnected={isConnected} isReading={isReading} onReadClick={onReadClick} />
      <Telereader chars={chars} showCursor={showCursor} onClearClick={onClearClick} />
    </div>
  );
}

export default App;
