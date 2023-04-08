# Campaign-Contract
This project intended to be a smart contract for funding money for product ideas.

## Installation
I used some useful packages such as dotenv, web3.js, ..., so with following command you can install packages, note: you should run it in root directory.

```
npm install
```

## Running Tests

```
npm run test
```

## Deployment
For deployment you should provide three informations: network, infura API key(I used infura platform for deployment) and your account private key. you should enter those information using envoirment variable values in a filed called .env(this file exist in root directory). and then simply run follwing command.

```
node deploy.js
