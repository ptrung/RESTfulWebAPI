/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  =========================================================*/

const SHA256 = require('crypto-js/sha256');

/* ===== Persist data with LevelDB ===================================
|  Learn more: level: https://github.com/Level/level     |
|  =============================================================*/

const level = require('level');
const chainDB = './chaindata';
const db = level(chainDB);

var debugging = null;

/* ===== Block Class ==============================
|  Class with a constructor for block 			   |
|  ===============================================*/

class Block{
	constructor(data){
		this.hash = "",
		this.height = 0,
		this.body = data,
		this.time = 0,
		this.previousBlockHash = ""
	}
}

/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/

class Blockchain{
	constructor(){
		var self = this;
		this.getBlockHeight().then(function(height) {
      if (height == 0){
        console.log("Generating genesis block");
        self.addBlock(new Block("First block in the chain - Genesis block"));
      }
    }).catch(function(error) {
      console.log('Error Constructor: ', error);
    })
	}

	// Add new block
	addBlock(newBlock){
		return new Promise(function(resolve, reject) {
			let i = 0;
			let self = this;
			let heighestKey = -1;

			db.createReadStream().on('data', function(data) {
					i++;
					// previous block hash
					if (heighestKey < parseInt(data.key)) {
						heighestKey = parseInt(data.key);
						newBlock.previousBlockHash = JSON.parse(data.value).hash;
					}

			}).on('error', function(err) {
				reject('Unable to read data stream!', err)
			}).on('close', function() {
				// block height
				newBlock.height = i;

				// UTC timestamp
				newBlock.time = new Date().getTime().toString().slice(0,-3);

				// Block hash with SHA256 using newBlock and converting to a string
				newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();

				// add Block to LevelDB
				db.put(i, JSON.stringify(newBlock), function(err) {
			    if (err) reject('Block ' + key + ' submission failed', err);
			  })
				resolve(newBlock);
			});
		});
	}

	// Get block height
	getBlockHeight(){
		return new Promise(function(resolve, reject) {
			let height = -1;

			db.createReadStream().on('data', function() {
				height++;
			}).on('error', function() {
				reject("Could not retrieve height");
			}).on('close', function() {
				resolve(height+1);
			});
		});
	}

	// get block
	getBlock(blockHeight){
		return new Promise(function(resolve, reject) {
			db.get(blockHeight, function(err, value) {
		    if (err) {
					reject('no block found');
				}
		    resolve(value);
		  })
		});
	}

	// validate block
	validateBlock(blockHeight){
		// get block object
		let blockPromise = this.getBlock(blockHeight);
		blockPromise.then(function(value) {
			// get block
			let block = JSON.parse(value);

			// get block hash
			let blockHash = block.hash;

      // remove block hash to test block integrity
      block.hash = '';

			// generate block hash
			let validBlockHash = SHA256(JSON.stringify(block)).toString();

			// Compare
			if (blockHash===validBlockHash) {
				return true;
			} else {
				console.log('Block #'+blockHeight+' invalid hash:\n'+blockHash+'<>'+validBlockHash);
				return false;
			}
		}).catch(function(error) {
			console.log('Error Validate Block: ', error);
		})
	}

	// Validate blockchain
	validateChain(){
		let i = 0;
		let self = this;
		let errorLog = [];

		db.createReadStream().on('data', function(data) {
			var block1 = self.getBlock(i);
			var block2 = self.getBlock(i+1);

			Promise.all([block1, block2]).then(function(values) {
				var block = JSON.parse(values[0]);
				var blockHash = block.hash;
				var previousBlockHash = JSON.parse(values[1]).previousBlockHash;

	      block.hash = '';
				var validBlockHash = SHA256(JSON.stringify(block)).toString();

				if (blockHash !== previousBlockHash)
					errorLog.push(JSON.parse(values[0]).height);
				else if(blockHash !== validBlockHash) {
					console.log('Block #'+blockHeight+' invalid hash:\n'+blockHash+'<>'+validBlockHash);
					errorLog.push(JSON.parse(values[0]).height);
				}
			}).catch(function(error) {
				if(error != 'no block found')
					console.log(error);
			})
			i++;
		}).on('error', function(err) {
			return console.log('Unable to read data stream!', err)
		}).on('close', function() {
			if (errorLog.length > 0) console.log('Block errors = ' + errorLog.length, '\nBlocks: '+errorLog);
			else console.log('No errors detected');
		});
	}

	// print blockchain
	printChain(){
		let i = 0;
		let self = this;
		let errorLog = [];

		db.createReadStream().on('data', function(data) {
			self.getBlock(i).then(function(value) {
				console.log('Block: ', value);
			}).catch(function(error) {
				console.log('Error Print Chain: ', error);
			});
			i++;
		}).on('error', function(err) {
			return console.log('Unable to read data stream!', err)
		})
	}
}

var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var blockchain = new Blockchain();

app.use(bodyParser.json());

app.get('/block/:num', function (req, res) {
  var num = req.params.num;
	blockchain.getBlock(num).then(function(block) {
		res.send(JSON.parse(block));
	}).catch(function(error) {
		res.send(error);
	})
});

app.post('/block', function (req, res) {
	var body = req.body.body;
	blockchain.addBlock(new Block(body)).then(function(block) {
		res.send(block);
	}).catch(function(error) {
		res.send(error);
	})
});

app.listen(8000, function () {
  console.log('App listening on port 8000!');
});
