var express = require('express')
var app = express()

const MongoClient = require('mongodb').MongoClient;

// Connection URL
const url = 'mongodb://localhost:27017';

let collection;
// Use connect method to connect to the server
MongoClient.connect(url, function(err, client) {
  console.log("Connected to mongodb")

  let db = client.db('shopware-intel')
  collection = db.collection('shopware-articles')
});

app.get('/', async (req, res) => {
  let price = req.query.price ? parseFloat(req.query.price) : undefined
  let matcher = {$match: {"price.amount": {$gte: 0}}}
  if (price) {
      matcher = {$match: {"price.amount": { $gte: price*0.5, $lte: price*1.3 }}}
  }
  let productArray = await collection.aggregate([
    matcher,
    { $match: {"image": {$regex: '^http.*'}}},
    { $sample: { size: 1 }}
  ]).toArray()
  let product = productArray[0]
  delete product._id
  res.send(product)
})

app.listen(3000)
