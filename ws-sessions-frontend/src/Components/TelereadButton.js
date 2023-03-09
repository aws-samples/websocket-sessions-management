import React from "react";
import Button from 'react-bootstrap/Button';
import Card from "react-bootstrap/Card";
import CardGroup from "react-bootstrap/CardGroup";

function TelereadButton(props) {
  const { isConnected, isReading, onReadClick } = props;

  return (
    <CardGroup className="d-flex justify-content-center Buttons-CardGroup">
      <Card className="Teleread-Button-Card">
        <Button onClick={onReadClick} disabled={!isConnected || isReading} variant="primary">
          Tele-read
        </Button>
      </Card>
    </CardGroup>
  );
}

export default TelereadButton;