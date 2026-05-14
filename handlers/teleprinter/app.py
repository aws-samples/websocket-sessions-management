import boto3
import os
import json
import requests
import time

api_url = os.environ['API_URL']
connections_table_name = os.environ['CONNECTIONS_TABLE_NAME']
sessions_table_name = os.environ['SESSIONS_TABLE_NAME']

ddb = boto3.client('dynamodb', region_name=os.environ['AWS_REGION'])
api_client = boto3.client(
    'apigatewaymanagementapi', endpoint_url=api_url)


def handler(event, context):
    print("================== context ==================")
    print(context)
    print("==================  event  ==================")
    print(json.dumps(event))

    connection_id = event['requestContext']['connectionId']

    user_id = get_user_id(connection_id)
    start_from = get_stored_cursor_position(user_id)

    print(type(start_from))
    print(start_from)

    text = get_wiki_article()
    text_to_send = text[start_from:]
    pos = start_from
    for ch in text_to_send:
        exec_status = send_char_to_client(user_id, connection_id, ch, pos)
        if exec_status:
            return exec_status
        pos += 1
        time.sleep(0.1)

    return {
        'statusCode': 200
    }


def send_char_to_client(user_id, connection_id, ch, pos):
    try:
        api_client.post_to_connection(
            ConnectionId=connection_id,
            Data=bytes(ch, 'utf-8')
        )
    except api_client.exceptions.GoneException:
        print("Found stale connection, persisting state")
        store_cursor_position(user_id, pos)
        return {
            'statusCode': 410
        }

    return None


def store_cursor_position(user_id, pos):
    ddb.put_item(
        TableName=sessions_table_name,
        Item={
            'userId': {'S': user_id},
            'cursorPosition': {'N': str(pos)}
        }
    )


def get_stored_cursor_position(user_id):
    if user_id:
        try:
            session_item = ddb.get_item(
                TableName=sessions_table_name,
                Key={
                    'userId': {
                        'S': user_id
                    }
                }
            )
            print(json.dumps(session_item))
            pos_str = session_item['Item']['cursorPosition']['N']
            return int(pos_str)
        except KeyError:
            pass
    return 0


def get_user_id(connection_id):
    response = ddb.query(
        TableName=connections_table_name,
        IndexName='connectionId-index',
        KeyConditionExpression='connectionId = :c',
        ExpressionAttributeValues={
            ':c': {'S': connection_id}
        }
    )

    connections = response['Items']

    if len(connections) == 1:
        return connections[0]['userId']['S']

    return None


def get_wiki_article():
    url = 'https://en.wikipedia.org/w/api.php'

    params = {
        'action': 'query',
        'format': 'json',
        'prop': 'extracts',
        'exintro': False,
        'exlimit': 'max',
        'explaintext': True,
        'titles': 'WebSocket'
    }

    headers = {
        'User-Agent': 'ws-sessions-management-demo/1.0 (https://github.com/aws-samples; contact@example.com)',
        'Accept': 'application/json'
    }

    response = requests.get(url, params=params, headers=headers, timeout=10)
    response.raise_for_status()
    data = response.json()
    text = list(data['query']['pages'].values())[0]['extract']
    print(text)

    return text
