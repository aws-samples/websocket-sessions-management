import boto3
import os

ddb = boto3.client('dynamodb')
table_name = os.environ.get('TABLE_NAME')


def handler(event, context):
    request_context = event['requestContext']
    connection_id = request_context['connectionId']
    domain_name = request_context['domainName']
    stage = request_context['stage']
    # The $connect route is protected by AWS_IAM and signed by guest
    # credentials issued by a Cognito Identity Pool. API Gateway populates
    # cognitoIdentityId after verifying the SigV4 signature, so this is a
    # server-vouched identifier -- not a value the client can forge by
    # rewriting headers or query strings. The previous implementation read
    # the user id from the Sec-WebSocket-Protocol header, which the browser
    # client could set to anything (see issue #13).
    identity = request_context.get('identity') or {}
    user_id = identity.get('cognitoIdentityId')
    if not user_id:
        # Defensive: with AuthorizationType: AWS_IAM on $connect, the request
        # cannot reach this Lambda without a valid SigV4 signature, so
        # cognitoIdentityId should always be present. If it isn't, the route
        # is misconfigured (e.g. AuthorizationType reverted to NONE, or the
        # stage is serving a stale Deployment snapshot from before AWS_IAM
        # was enabled). Reject rather than write a forgeable record.
        print(f'$connect rejected: no cognitoIdentityId on requestContext.identity')
        return {'statusCode': 401}

    ddb.put_item(
        TableName=table_name,
        Item={
            'userId': {'S': user_id},
            'connectionId': {'S': connection_id},
            'domainName': {'S': domain_name},
            'stage': {'S': stage},
            'active': {'S': "True"}
        }
    )

    return {
        'statusCode': 200
    }
