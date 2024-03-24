import React from "react";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";

function CurrentUserHeader(props) {
  const { userId, onResetIdentityClick } = props;

  return (
    <Card className="mb-6">
      <Card.Header>
        <div className="grid grid-cols-3 align-items-center">
          <div>
            Current user ID: <b>{userId}</b>
          </div>
          <div>
            <Button onClick={onResetIdentityClick} variant="danger">
              Reset Identity
            </Button>
          </div>
        </div>
      </Card.Header>
    </Card>
  );
}

export default CurrentUserHeader;
