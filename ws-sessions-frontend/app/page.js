"use client";

import React, { useCallback, useEffect, useState } from "react";
import CurrentUserHeader from "./Components/CurrentUserHeader";
import Telereader from "./Components/Telereader";
import WebsocketConnector from "./Components/WebsocketConnector";
import {
  clearIdentity,
  getCachedIdentityId,
  getSignedConnectUrl,
} from "./lib/wsAuth";

// Baked in at build time via Next.js static export. Without it the frontend
// has nowhere to authenticate against, so we surface a clear error in the UI
// instead of failing inside the WebSocket constructor.
const IDENTITY_POOL_ID = process.env.NEXT_PUBLIC_IDENTITY_POOL_ID;

export default function Home() {
  const [ws, setWs] = useState();
  const [userId, setUserId] = useState();
  const [isConnected, setIsConnected] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [chars, setChars] = useState([]);
  const [showCursor, setShowCursor] = useState(true);
  const [authError, setAuthError] = useState();

  const connectToWs = async (event) => {
    event.preventDefault();
    const wsUrl = event.target.elements.formWebsocketUrl.value;
    if (!wsUrl) return;
    if (!IDENTITY_POOL_ID) {
      setAuthError(
        "NEXT_PUBLIC_IDENTITY_POOL_ID is not set. Build the frontend with the IdentityPoolId from the SAM stack outputs."
      );
      return;
    }

    let signedUrl;
    let identityId;
    try {
      ({ signedUrl, identityId } = await getSignedConnectUrl(
        wsUrl,
        IDENTITY_POOL_ID
      ));
    } catch (err) {
      console.error("Failed to obtain guest credentials", err);
      setAuthError(err.message ?? String(err));
      return;
    }

    setUserId(identityId);
    setAuthError(undefined);

    const newWebsocket = new WebSocket(signedUrl);
    setWs(newWebsocket);

    newWebsocket.onerror = () => {
      console.log("Error occured in WebSocket connection. Terminating...");
      setIsConnected(false);
    };
    newWebsocket.onopen = () => {
      console.log("WebSocket connection opened");
      setIsConnected(true);
    };
    newWebsocket.onmessage = (e) => {
      setChars((prevChars) => [...prevChars, e.data]);
    };
    newWebsocket.onclose = () => {
      console.log("WebSocket connection closed");
      setIsConnected(false);
      setIsReading(false);
    };
  };

  // Show the cached IdentityId on first paint so the header doesn't flicker
  // through "undefined" while the user is staring at the Connect form.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const cached = getCachedIdentityId();
    if (cached) setUserId(cached);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const onReadClick = useCallback(() => {
    setIsReading(true);
    ws.send(JSON.stringify({ action: "teleprinter" }));
  }, [ws]);

  const onDisconnectClick = () => {
    if (isConnected) ws.close();
  };

  const onClearClick = () => setChars([]);

  const onResetIdentityClick = () => {
    clearIdentity();
    setUserId(undefined);
    onDisconnectClick();
    onClearClick();
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      setShowCursor((prevValue) => !prevValue);
    }, 500);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <main>
      <div>
        <CurrentUserHeader
          userId={userId}
          onResetIdentityClick={onResetIdentityClick}
        />
      </div>
      {authError && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 rounded">
          {authError}
        </div>
      )}
      <div className="grid grid-rows-3 grid-flow-col gap-2 place-content-center">
        <div>
          <WebsocketConnector
            isConnected={isConnected}
            isReading={isReading}
            connectToWs={connectToWs}
            onDisconnectClick={onDisconnectClick}
            onReadClick={onReadClick}
          />
        </div>
        <div>
          <Telereader
            chars={chars}
            showCursor={showCursor}
            onClearClick={onClearClick}
          />
        </div>
      </div>
    </main>
  );
}
