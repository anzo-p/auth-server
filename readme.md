### Create new TypeScript / NodeJs project

```
npm init -y

npm i express dotenv
npm i -D typescript @types/express @types/node
npm i -D nodemon ts-node

npx tsc --init

"compilerOptions": {
  "outDir": "./dist"

{
  "scripts": {
    "build": "npx tsc",
    "start": "node dist/server.js",
    "dev": "nodemon src/server.ts"
  }
}

npm run build
npm run dev
```

### Add Policy to access DynamoDb table

```
{
	"Version": "2012-10-17",
	"Statement": [
		{
			"Sid": "VisualEditor0",
			"Effect": "Allow",
			"Action": [
				"dynamodb:PutItem",
				"dynamodb:DeleteItem",
				"dynamodb:GetItem",
				"dynamodb:Query",
				"dynamodb:UpdateItem"
			],
			"Resource": [
			    "arn:aws:dynamodb:<region>:<account>:table/auth_server_UserData",
			    "arn:aws:dynamodb:<region>:<account>:table/auth_server_UserData/index/email-index"
		    ]
		}
	]
}
```
