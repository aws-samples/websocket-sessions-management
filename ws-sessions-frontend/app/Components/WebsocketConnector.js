import React from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import CardGroup from "react-bootstrap/CardGroup";

function WebsocketConnector(props) {
  const { connectToWs, isConnected, onDisconnectClick } = props;

  return (
    <CardGroup className="center-content">
      <Card className="p-4">
        <Form onSubmit={connectToWs} className="">
          <Form.Group className="" controlId="formWebsocketUrl">
            <Form.Label className="text-2xl">Enter Websocket URL</Form.Label>
            <Form.Control
              className="mb-2"
              type="text"
              placeholder="Websocket URL"
            />
            <Form.Text className="text-xs">
              <p className="m-0">Enter your Websocket URL:</p>
              <p className="ml-2 italic">
                wss://API_ID.execute-api.AWS_Region.amazonaws.com/STAGE_NAME.
              </p>
              <p>
                Find this information in SAM deployment output under key
                WebSocketURL.
              </p>
            </Form.Text>
          </Form.Group>
          <Button disabled={isConnected} variant="primary" type="submit">
            Connect
          </Button>
          <Button
            className="ml-4"
            onClick={onDisconnectClick}
            disabled={!isConnected}
            variant="secondary"
          >
            Disconnect
          </Button>
        </Form>
      </Card>
    </CardGroup>
  );
}

export default WebsocketConnector;
