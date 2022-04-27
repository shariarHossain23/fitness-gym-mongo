const express = require("express")
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const cors = require("cors");
const { decode } = require("jsonwebtoken");
const app =express()
require ("dotenv").config()
const port =process.env.PORT || 4000



app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.USER_DB}:${process.env.USER_PASS}@cluster0.zf96d.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run(){
    try{
        await client.connect()
        
        const gymCollection = client.db("gym-center").collection("service")
        const orderCollection = client.db("order").collection("user")


        // get all  service
        app.get('/service',async(req,res)=>{
            const query = {}
            const cursor = gymCollection.find(query)
            const result = await cursor.toArray()
            res.send(result)
        })

        app.get('/service/:id',async(req,res)=>{
            const id = req.params.id
            const singleUserid = {_id:ObjectId(id)}
            const singleUser = await gymCollection.findOne(singleUserid)
            res.send(singleUser)
        })
        // jwt verify
        function verifyJwt(req,res,next){
            const authHeader = req.headers.authorization
           if(!authHeader){
               return res.status(401).send({message:"user unauthorized"})
           }

           const token = authHeader.split(" ")[1]
           jwt.verify(token,process.env.USER_SECTET,(err,decoded)=>{
               if(err){
                   return res.status(403).send({message:"user forbidden"})
               }
              req.decoded = decoded
              next()
           })
            
        }

        // jwt collection
        app.get("/order",verifyJwt,async(req,res)=>{
            const decodedEmail = req.decoded.email
            const email = req.query.email
            if(email === decodedEmail){
                const query ={email:email}
                const cursor = orderCollection.find(query)
                const result = await cursor.toArray()
                res.send(result)
            }
            else{
                res.status(403).send({message:"forbidden user"})
            }
           
           
            
        })

        //  jwt  post 
        app.post("/order",async(req,res)=>{
            const order = req.body
            const result = await orderCollection.insertOne(order)
            res.send(result)
        })

        // generate gwt token  
        app.post("/login",async(req,res)=>{
            const user = req.body
            const accessToken = jwt.sign(user,process.env.USER_SECTET,{
                expiresIn:("1d")
            })
            res.send(accessToken)
        })

    }

    finally{}
}
run().catch(console.dir)


app.listen(port,()=>{
    console.log("gym center running",port);
})