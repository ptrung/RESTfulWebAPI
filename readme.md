# RESTful Web API

A RESTful web API to access a private blockchain

## Used Node.js Frameworks

[Express](http://expressjs.com/) is used to create the endpoint

[Body-parser](https://www.npmjs.com/package/body-parser) parses the incoming post request body

[Crypto-js](https://www.npmjs.com/package/crypto-js) is used to create the hashes of the blockchain

[Level](https://www.npmjs.com/package/crypto-js) provides the access to save the blockchain in a LevelDB database.

## Getting Started

1. Run the command `npm install` to install the used Node.js frameworks.
2. Run the command `node app.js` to start the program.  
3. Now you can call the endpoints at localhost:8000 in your browser

## Endpoints

### Block content
Returns the blockcontent in JSON format
* **URL:** `/block/{BLOCK_HEIGHT}`
* **Method:** `GET`
* **Success Response**:
`{
  "hash":"49cce61ec3e6ae664514d5fa5722d86069cf981318fc303750ce66032d0acff3",
  "height":0,
  "body":"First block in the chain - Genesis block",
  "time":"1530311457",
  "previousBlockHash":""
}`
* **Error Response**:
`{
  "error": "no block found"
}`

### Add block
Adds a new block to the blockchain with the provided body
* **URL:** `/block/`
* **Method:** `POST`
* **Content-Type:** `application/json`
* **Data Params:** `{"body":"block body contents"}`
* **Success Response**:
`{
  "hash":"4dfe37617b0013095d7e92509204fdeb0ba9041b81363738e252c5645f084171",
  "height":10,
  "body":"block body contents",
  "time":"1532417207",
  "previousBlockHash":"e641a614a513651ad7e16192bc93153baa7416eb8217b8b26f958f8b32d857d8"
}`
* **Error Response**:
`{
  "error":"Could not add block. Body was empty"
}`

## Acknowledge

This project was built during the beta of the Udacity course "Blockchain Developer".
