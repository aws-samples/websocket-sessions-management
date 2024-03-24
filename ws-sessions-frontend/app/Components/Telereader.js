import React from "react";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import CardGroup from "react-bootstrap/CardGroup";

function Telereader(props) {
  const { chars, showCursor, onClearClick } = props;

  return (
    <CardGroup className="min-h-44 -mt-48">
      <Card>
        <Card.Body>
          <Card.Title>
            <Button
              onClick={onClearClick}
              disabled={chars.length < 1}
              variant="secondary"
            >
              Clear
            </Button>
          </Card.Title>
          <Card.Text className="max-w-96">
            {chars.length > 0 ? (
              <p className="text-wrap">
                {chars}
                <span>{showCursor ? "▒" : ""}</span>
              </p>
            ) : (
              "Teletyped text will appear here."
            )}
          </Card.Text>
        </Card.Body>
      </Card>
    </CardGroup>
  );
}

export default Telereader;
