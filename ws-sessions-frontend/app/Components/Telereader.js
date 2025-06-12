import React from "react";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import CardGroup from "react-bootstrap/CardGroup";

function Telereader(props) {
  const { chars, showCursor, onClearClick } = props;

  return (
    <CardGroup className="min-h-44">
      <Card>
        <Card.Body>
          <Card.Title>
            <Button
              className="bg-gray-500"
              onClick={onClearClick}
              disabled={chars.length < 1}
              variant="secondary"
            >
              Clear
            </Button>
          </Card.Title>
          <Card.Text className="max-w-96 text-wrap">
            {chars.length > 0 ? (
              <>
                {chars}
                <span>{showCursor ? "▒" : ""}</span>
              </>
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
