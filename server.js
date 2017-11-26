var express = require('express');
var mongo = require('mongodb')
var url = require('url');
var uri = "mongodb://"+process.env.MONGO_USER+":"+process.env.MONGO_PASS+"@ds235785.mlab.com:35785/singletempo";
var app = express();

const GoogleImages = require('google-images');
 
const client = new GoogleImages(process.env.CSE, process.env.KEY);


app.use(express.static('public'));

//Homepage
app.get("/",(req,res)=>{
  res.sendFile(__dirname + '/views/index.html');
})

app.get("/search/:str", (request, response)=>{
  //get and parse url
  var address = request.get('host')+request.originalUrl
var a = url.parse(address, true);
  var pageNumber  = a.query.offset;

  //save to history
  mongo.MongoClient.connect(uri,(err,db)=>{
    db.collection('imageHistory').insert({searched: request.params.str},(err,result)=>{
      console.log(result)
    })
  })
  
  //make search
  var sent = [];
  client.search(request.params.str,  {page: pageNumber})
    .then(images => {
     
    images.forEach((x)=>{
    sent.push(x.url+x.description+x.parentPage)
    })
    
    response.send(sent)
    
    }); 
  //response.sendFile(__dirname + '/views/index.html');
});


app.get('/history',(req,res)=>{
    mongo.MongoClient.connect(uri,(err,db)=>{
    db.collection('imageHistory').find({}).toArray((err,result)=>{
      res.send(result)
    })
  })
})


var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
