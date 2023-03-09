import React from "react";
import Button from 'react-bootstrap/Button';
import Card from "react-bootstrap/Card";
import CardGroup from "react-bootstrap/CardGroup";

function Telereader(props) {
  const { chars, showCursor, onClearClick } = props;

  return (
    <CardGroup className="Text-CardGroup">
      <Card className="Text-Card">
        <Card.Body>
          <Card.Title className="Clear-Button-Card">
            <Button onClick={onClearClick} disabled={chars.length < 1} variant="secondary">
              Clear
            </Button>
          </Card.Title>
          <Card.Text>
            {
              chars.length > 0 ?
                <>
                  <p style={{ textAlign: "left" }}>
                    {chars}
                    <span>
                      {showCursor ? "▒" : ""}
                    </span>
                  </p>
                </>
                :
                "Teletyped text will appear here."
            }
          </Card.Text>
        </Card.Body>
      </Card>
    </CardGroup>
  );
}

export default Telereader;