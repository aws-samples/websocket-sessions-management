import boto3
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
    domain_name = event['requestContext']['domainName']
    stage = event['requestContext']['stage']
    userId = event['headers']['Sec-WebSocket-Protocol']

    print("==================  userID  ==================")
    print(userId)

    ddb.put_item(
        TableName=table_name,
        Item={
            'userId': {'S': userId},
            'connectionId': {'S': connection_id},
            'domainName': {'S': domain_name},
            'stage': {'S': stage},
            'active': {'S': "True"}
        }
    )

    return {
        'statusCode': 200,
        'headers': {
            'Sec-WebSocket-Protocol': userId
        }
    }

def get_item_by_connectionId(connection_id):
    return ddb.query(
        TableName=table_name,
        IndexName='connectionId-index',
        KeyConditionExpression='connectionId = :c',
        ExpressionAttributeValues={
            ':c': {'S': connection_id}
        }
    )['Items']

def add_to_connections_table(connection_item):
    ddb.put_item(
        TableName=table_name,
        Item=connection_item
    )

def update_connection_status(userId, connection_id):
    ddb.update_item(
        TableName=table_name,
        Key={
            'userId': {'S': userId},
        },
        UpdateExpression="set active = :r, set connectionId = :c",
        ExpressionAttributeValues={
            ':r': { "BOOL": True}, 
            ':c': { "S": connection_id }
        }
    )
