make# n-url-management-api-read-client

Communicates directly with the DynamoDB tables.

## IAM Permissions

You will need the following IAM permissions:-

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:BatchGetItem"
      ],
      "Resource": "arn:aws:dynamodb:*:*:table/urlmgmtapi_*"
    }
  ]
}
```

## Environment variables

Expects:-
- `URLMGMTAPI_AWS_ACCESS_KEY`
- `URLMGMTAPI_AWS_SECRET_KEY`
