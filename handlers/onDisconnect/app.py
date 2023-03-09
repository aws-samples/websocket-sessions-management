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

    timestamp = int(time.time())

    ddb.update_item(
        TableName=table_name,
        Key={
            'userId': {'S': response['Items'][0]['userId']['S']},
        },
        UpdateExpression="set active = :r, lastSeen = :t",
        ExpressionAttributeValues={
            ':r': { "S": "False" },
            ':t': { "N": str(timestamp) }
        }
    )
