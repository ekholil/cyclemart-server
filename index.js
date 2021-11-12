const express = require('express')
const { MongoClient } = require('mongodb');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000;
const cors = require('cors')
const ObjectId = require('mongodb').ObjectId

app.use(cors())
app.use(express.json())
app.get('/', (req, res) => {
    res.send('This is the server of cycleMart')
})

app.listen(port, () => {
    console.log('server is running at ', port)
})


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.odpvs.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
      await client.connect();
      const cycleCollection = client.db("cyclemart").collection("products");
      const ordersCollection = client.db("cyclemart").collection("orders");
      const reviewCollection = client.db("cyclemart").collection("reviews")
      const usersCollection = client.db("cyclemart").collection("users")
      
     // find all products
      app.get('/products', async(req, res) => {
        const result = await cycleCollection.find({}).toArray()
        res.send(result) 
      })

      //find all orders
      app.get('/orders', async(req, res) => {
        const result = await ordersCollection.find({}).toArray()
        res.send(result) 
      })

      // api for find single product with id
      app.get('/products/:id', async(req, res) => {
        const id = req.params.id
        const query = {_id : ObjectId(id)}
        const result = await cycleCollection.findOne(query)
        res.send(result)
      })
    
      // //post api
      app.post('/addproduct', async(req, res) => {
        const data = req.body;
        const result = await cycleCollection.insertOne(data)
        res.json(result)
      })
      // //post api for buy now
      app.post('/orders', async(req, res) => {
        const data = req.body;
        const result = await ordersCollection.insertOne(data)
        res.send(result)
        console.log(result)
      })
      // //post api for review
      app.post('/review', async(req, res) => {
        const data = req.body;
        const result = await reviewCollection.insertOne(data)
        res.send(result)
        console.log(result)
      })
      // check admin
      app.get('/users/:email', async(req, res) => {
        const email = req.params.email;
        const query = {email: email}
        const user = await usersCollection.findOne(query)
        let isAdmin = false
        if(user?.role === 'admin'){
          isAdmin = true;
        }
        res.json({admin: isAdmin})
      })
      // //post api for save user in db
      app.post('/users', async(req, res) => {
        const data = req.body;
        const result = await usersCollection.insertOne(data)
        res.send(result)
        console.log(result)
      })
      // make admin api 
      app.put('/users/admin', async(req, res) => {
        const user = req.body;
        const filter = {email : user.email}
        const updateDoc = {$set : {role: 'admin'}}
        const result = await usersCollection.updateOne(filter, updateDoc)
        res.json(result)
      })
      // // api for find orders by email
      app.get('/myorders/:email', async(req, res) => {
        const email = req.params.email;
        const query = {email : email}
        const result = await ordersCollection.find(query).toArray()
        res.send(result)
      })
    
      // //delete api
      app.delete('/cancelorder/:id', async(req, res) => {
        const id = req.params.id;
        const query = {_id : ObjectId(id)}
        const result = await ordersCollection.deleteOne(query)
        res.json(result)
      })
      // //delete api from manage order
      app.delete('/deleteorder/:id', async(req, res) => {
        const id = req.params.id;
        const query = {_id : ObjectId(id)}
        const result = await ordersCollection.deleteOne(query)
        res.json(result)
      })
      // //delete api from manage products
      app.delete('/products/:id', async(req, res) => {
        const id = req.params.id;
        const query = {_id : ObjectId(id)}
        const result = await cycleCollection.deleteOne(query)
        console.log(result)
        res.json(result)
      })
      // // update
      app.put('/updatestatus/:id', async(req, res) => {
        const id = req.params.id;
        const item = req.body;
        const filter = {_id : ObjectId(id)}
        const options = { upsert: true };
        // create a document that sets the plot of the movie
        const updateDoc = {
          $set: {
            status: item.status,
          },
        };
        const result = await ordersCollection.updateOne(filter, updateDoc, options)
        console.log('upadating user ', id)
        res.send(result)
        
      })
      
    } finally {
    
    }
  }
  run().catch(console.dir);
