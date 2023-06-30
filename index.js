const bodyParser = require("body-parser");
const express = require("express");
const Blockchain = require("./blockchain");
const PubSub = require("./publishsubscribe");
const request = require('request');

const app = express();
const blockchain = new Blockchain();
const pubsub = new PubSub({ blockchain });

const DEFAULT_PORT = 3000;
const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`;
setTimeout(() => pubsub.broadcastChain(), 1000);

app.get("/api/blocks", (req, resp) => {
  resp.json(blockchain.chain);
});

app.use(bodyParser.json());
app.post("/api/mine", (req, resp) => {
  const { data } = req.body;

  blockchain.addBlock({ data });
  pubsub.broadcastChain();
  resp.redirect("/api/blocks");
});

const syncChains=()=>{
    request({url:`${ROOT_NODE_ADDRESS}/api/blocks`},(error,response,body)=>{
        if(!error && response.statusCode===200){
            const rootChain = JSON.parse(body);
            console.log('Replace chain on sync with',rootChain)
        }

    })
}

let PEER_PORT;
if(process.env.GENERATE_PEER_PORT === "true"){
    PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random()*1000);
}
const PORT = PEER_PORT || DEFAULT_PORT;
app.listen(PORT, () => {
  console.log(`Listening to PORT :: ${PORT}`);
  syncChains();
});
