## A small express excercise

Register.

```
POST ../api/auth/register { email }
```

Login. Receive magic link. This time in response, would really go to email.

```
POST ../api/auth/authenticate/get { email } -> magic link

GET <magic link> -> userToken and refreshToken
```

Refresh authentication automatically in background by Frontend App.

```
POST ../api/auth/authenticate/refresh { userToken, refreshToken } -> new userToken and refreshToken
```

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

### AWS: Requires following policy to use DynamoDb

```
{
	"Version": "2012-10-17",
	"Statement": [
		{
			"Effect": "Allow",
			"Action": [
				"dynamodb:PutItem",
				"dynamodb:DeleteItem",
				"dynamodb:GetItem",
				"dynamodb:Query",
				"dynamodb:UpdateItem"
			],
			"Resource": [
				"arn:aws:dynamodb:<rgion>:<account>:table/auth_server_UserData",
				"arn:aws:dynamodb:<rgion>:<account>:table/auth_server_UserData/index/email-index",
				"arn:aws:dynamodb:<rgion>:<account>:table/auth_server_UserData/index/loginToken-index"
			]
		}
	]
}
```
