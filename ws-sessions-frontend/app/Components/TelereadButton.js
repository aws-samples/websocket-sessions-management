import React from "react";
import Button from "react-bootstrap/Button";

function TelereadButton(props) {
  const { isConnected, isReading, onReadClick } = props;

  return (
    <Button
      className="my-2 w-full"
      onClick={onReadClick}
      disabled={!isConnected || isReading}
      variant="primary"
    >
      Tele-read
    </Button>
  );
}

export default TelereadButton;
