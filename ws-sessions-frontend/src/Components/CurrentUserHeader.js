import React from "react";
import Button from 'react-bootstrap/Button';
import Card from "react-bootstrap/Card";

function CurrentUserHeader(props) {
    const { userId, onResetIdentityClick } = props;

    return (
        <Card>
            <Card.Header>
            <div className="hstack gap-5">
                <div>Current user ID: <b>{userId}</b></div>
                <div className="vr"></div>
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