initialize project

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
