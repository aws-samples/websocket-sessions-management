import React from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import CardGroup from "react-bootstrap/CardGroup";

function WebsocketConnector(props) {
  const {
    connectToWs,
    isConnected,
    isReading,
    onDisconnectClick,
    onReadClick,
  } = props;

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
          <div className="grid grid-rows-2 gap-2">
            <div className="grid grid-cols-2 gap-2">
              <Button
                className="w-full bg-blue-500"
                disabled={isConnected}
                variant="primary"
                type="submit"
              >
                Connect
              </Button>
              <Button
                className="w-full bg-red-500"
                onClick={onDisconnectClick}
                disabled={!isConnected}
                variant="danger"
              >
                Disconnect
              </Button>
            </div>
            <div>
              <Button
                className="w-full bg-blue-500"
                onClick={onReadClick}
                disabled={!isConnected || isReading}
                variant="primary"
              >
                Tele-read
              </Button>
            </div>
          </div>
        </Form>
      </Card>
    </CardGroup>
  );
}

export default WebsocketConnector;
