import time
import boto3
from boto3.dynamodb.conditions import Key
import os
import json
from datetime import datetime, timedelta

connections_table_name = os.environ.get('CONNECTIONS_TABLE_NAME')
sessions_table_name = os.environ.get('SESSIONS_TABLE_NAME')

dynamodb = boto3.resource('dynamodb')

table_connections = dynamodb.Table(connections_table_name)
table_sessions = dynamodb.Table(sessions_table_name)


def handler(event, context):
    print("================== context ==================")
    print(context)
    print("==================  event  ==================")
    print(json.dumps(event))

    five_minutes_ago = int((datetime.now() - timedelta(minutes=5)).timestamp())

    stale_connection_items = table_connections.query(
        IndexName='lastSeen-index',
        KeyConditionExpression='active = :hk and lastSeen < :rk',
        ExpressionAttributeValues={
            ':hk': 'False',
            ':rk': five_minutes_ago
        }
    )

    inactive_user_count = len(stale_connection_items['Items'])
    print(f'{inactive_user_count} inactive users will be removed')
    
    inactive_users = stale_connection_items['Items']

    # remove inactive connections
    with table_connections.batch_writer() as batch:
        for item in inactive_users:
            batch.delete_item(Key={'userId': item['userId']})

    # remove inactive sessions
    with table_sessions.batch_writer() as batch:
        for item in inactive_users:
            batch.delete_item(Key={'userId': item['userId']})
