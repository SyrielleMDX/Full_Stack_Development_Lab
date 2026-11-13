const express = require('express');
const app = express();
const PORT = 3000;
const path = require('path');
const cors = require('cors');
app.use(cors());
app.use(express.json());

//Load and serve static images
app.use('/images', express.static(path.join(__dirname, 'images')));

let myProduct = require('./products.js');
let db;

console.log(myProduct);

// use morgan library
var morgan = require('morgan')

// Set up Morgan to log the HTTP method and path
//app.use(morgan(':method :url'));
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));

app.use((req, res, next) => {
    console.log('Incoming request: ' + req.method + ' from: ' + req.url);
    //res.end('Hello World !!!')
    next();
});

require("dotenv").config({ path: "../config.env" });
const { MongoClient, Db } = require("mongodb");
const { error } = require('console');

const uri = process.env.MONGODB_PREFIX + 
            process.env.MONGODB_USERNAME + ":" +
            process.env.MONGODB_PASSWORD +
            process.env.MONGODB_URL;

const client = new MongoClient(uri);
// MongoClient("mongodb+srv://syrielleramtohul_db_user:iaD41tXrWYWv9PIn@cluster0.mlh18tb.mongodb.net/")

// Connect to MongoDB
async function connectToMonoDB() {
    try {
        await client.connect();
        db = client.db("PetStore");
        console.log("You successfully connected to MongoDB");
        return client;
    }

    catch (err) {
        console.error("MongoDB connection error:", err);
    }
}

connectToMonoDB();

// app.get('/collections/products', (req, res)=>{
//     //res.send('A GET request, I read and send back the result to you')
//     res.json(myProduct);
// })

app.get("/products", async function (req, res) {
    try {
        if (!db) {
            return res.status(500).json({
                error: "Database not connected"
            });
        }

        const collection = db.collection("Products");
        const results = await collection.find({}).toArray();

        res.json(results);
    } catch (err) {
        console.error("Error fetching products:", err);

        res.status(500).json({
            error: "Failed to fetch products"
        });
    }
});

app.post("/orders", async function(req, res) {
    var body = req.body;
    let collection = await db.collection("orders")
    let result = await collection.insertOne(body);
    res.send(result)
});

app.post("/names", function(request, response){
 var body = request.body;
 console.log(body);
 response.json("New Name Recieved: " + body.firstname + " " + body.lastname);
});

app.put("/", (req, res)=>{
    res.send("Let's change an element");    
})

app.delete("/", (req, res)=>{
    res.send("Let's delete an element");
})

app.use((req, res) => {
    res.status(404).send("Page not found !")
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
})