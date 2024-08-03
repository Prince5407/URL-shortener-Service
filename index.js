const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;
const DEFAULT_TTL = 120;

let urlStore = {};
let aliasStore = {};
let analyticsStore = {};

app.post('/shorten', (req, res) => {
    const { long_url, custom_alias, ttl_seconds } = req.body;
    const alias = custom_alias || uuidv4().slice(0, 6);
    const ttl = ttl_seconds || DEFAULT_TTL;
    const expiresAt = Date.now() + ttl * 1000;

    aliasStore[alias] = { longUrl: long_url, expiresAt };
    urlStore[long_url] = alias;
    analyticsStore[alias] = { accessCount: 0, accessTimes: [] };

    res.json({ short_url: `https://short.ly/${alias}` });
});

app.get('/:alias', (req, res) => {
    const { alias } = req.params;
    const entry = aliasStore[alias];
    console.log(`${alias}`);
    console.log(`${entry}`);
    if (entry && entry.expiresAt > Date.now()) {
        console.log( analyticsStore[alias].accessCount );
        console.log(new Date());
        console.log( analyticsStore[alias].accessTimes);
        analyticsStore[alias].accessCount += 1;
        analyticsStore[alias].accessTimes.push(new Date());
        
        res.redirect(302, entry.longUrl);
    } else {
        res.status(404).send('Alias does not exist or has expired');
    }
});



app.get('/analytics/:alias',(req,res)=>{
const { alias } = req.params;
    const entry = aliasStore[alias];
    console.log(`${alias}`);
    console.log(`${entry}`);
    console.log(entry.expiresAt);
    console.log(Date.now());
    if (entry && entry.expiresAt > Date.now()) {
        res.json({
            alias,
            long_url: entry.longUrl,
            access_count: analyticsStore[alias].accessCount,
            access_times: analyticsStore[alias].accessTimes.slice(-10)
        });
    } else {
        res.status(404).send('Alias does not exist or has expired.');
    }


});


app.put('update/:alias',(req,res)=>{

   
const {alias}=req.params;

const {custom_alias,ttl_seconds}=req.body;
const entry=aliasStore[alias];


if (entry && entry.expiresAt > Date.now()){


    console.log("Check");
    const updatedAlias=custom_alias;
    const updatedTTL=ttl_seconds;
    const updatedExpiry=Date.now()+updatedTTL*1000;


           if(custom_alias && (alias !=custom_alias)){

delete aliasStore[alias];
delete analyticsStore[store];

           }

         aliasStore[updatedAlias]={longUrl:entry.longUrl , expiresAt:updatedExpiry};
         urlStore[entry.longUrl]=updatedAlias;
         analyticsStore[updatedAlias]={accessCount:0,accessTimes:[]};
         res.status(200).send("Successfull");

}
else{
    res.status(404).send("Alias does not exist or it is expired");
}
    

   


});

app.delete('/delete/:alias',(req,res)=>{

    const { alias } = req.params;
    console.log(`${alias}`);
    const entry = aliasStore[alias];
    console.log(`${entry}`);

    if (entry) {
        delete aliasStore[alias];
        delete urlStore[entry.longUrl];
        delete analyticsStore[alias];
        res.status(200).send('Successfully deleted.');
    } else {
        res.status(404).send('Alias does not exist or has expired.');
    }


});


app.listen(PORT ,()=>{

console.log(`Server is running on ${PORT}` );

});