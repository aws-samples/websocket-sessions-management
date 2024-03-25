import React from "react";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";

function CurrentUserHeader(props) {
  const { userId, onResetIdentityClick } = props;

  return (
    <Card className="mb-6 bg-gradient-to-r from-slate-300">
      <Card.Header>
        <div className="grid grid-cols-2">
          <div>
              Current user ID: <b className="text-xl">{userId}</b>
          </div>
          <div className="-m-1 justify-self-end">
            <Button className="bg-red-500" onClick={onResetIdentityClick} variant="danger">
              Reset Identity
            </Button>
          </div>
        </div>
      </Card.Header>
    </Card>
  );
}

export default CurrentUserHeader;
