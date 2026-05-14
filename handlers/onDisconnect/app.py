import time
import boto3
import os

ddb = boto3.client('dynamodb')
table_name = os.environ.get('TABLE_NAME')

def handler(event, context):
    connection_id = event['requestContext']['connectionId']
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
