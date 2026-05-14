import time
import boto3
from boto3.dynamodb.conditions import Key
import os
import json

ddb = boto3.client('dynamodb')
table_name = os.environ.get('TABLE_NAME')

def handler(event, context):
    print("================== context ==================")
    print(context)
    print("==================  event  ==================")
    print(json.dumps(event))

    connection_id = event['requestContext']['connectionId']
    print(connection_id)
    print(type(connection_id))
    deactivate_user_connection(connection_id)
    return {
        'statusCode': 200
    }

def deactivate_user_connection(connection_id):
    response = ddb.query(
        TableName=table_name,
        IndexName='connectionId-index',
        KeyConditionExpression='connectionId = :c',
        ExpressionAttributeValues={
            ':c': {'S': connection_id}
        }
    )

    print(json.dumps(response))

    items = response['Items']
    if not items:
        # The connection record may have already been removed by the
        # OnDelete sweep (which evicts entries idle for more than 5
        # minutes). In that case there is nothing to deactivate.
        print(f'No connection record found for connectionId={connection_id}; nothing to deactivate')
        return

    timestamp = int(time.time())

    ddb.update_item(
        TableName=table_name,
        Key={
            'userId': {'S': items[0]['userId']['S']},
        },
        UpdateExpression="set active = :r, lastSeen = :t",
        ExpressionAttributeValues={
            ':r': { "S": "False" },
            ':t': { "N": str(timestamp) }
        }
    )
