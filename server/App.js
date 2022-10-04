const SerialPort = require('serialport').SerialPort;
var express = require('express');
var mongodb = require('mongodb');
var mongoose = require('mongoose');
var MongoClient = require('mongodb').MongoClient;
var x = 0;
//mongodb://localhost:27017
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
var url = "mongodb://127.0.0.1:27017/";
var path = require('path')
var routes = require('./routes')
var router = express.Router();
const app = express();
var http = require('http');
var server = http.createServer(app);
var io = require("socket.io")(server, {cors:{
    origin: "*"}
  });


var string
var temperature
var  humidite 
var humiSP1
var  humiditeSPourcent1
var  humiditeS1
var dbo



app.set("port", process.env.PORT || 3000)
app.set("views",path.join(__dirname,"views"))
app.use(express.static(__dirname));
app.set("view engine", "ejs")
const { Schema } = mongoose;
const slaveSchema = new Schema({
    Temperature: { type: Number,required: true }, // String is shorthand for {type: String}
    Humidity: { type: Number, required: true },
    date: { type: Date,
           default: Date.now, required: true },
    s1: { humidity1:{ type: Number, required: true },
      temperature1:{ type: Number, required: true },
      HumSV1:{ type: Number, required: true },
      HumSP1:{ type: Number, required: true }
    },
    s2: { 
      humidity2: { type: Number, required: true },
      temperature2:{ type: Number, required: true },
      HumSV2:{ type: Number, required: true },
      HumSP2:{ type: Number, required: true },
    Date: { type: String, required: true },
    Heur: { type: String, required: true }
    }
  });
  const slave = mongoose.model('slave', slaveSchema);
  const recieverSchema = new Schema({
    RecieverNumber: { type: Number,required: true }, // String is shorthand for {type: String}
    State: { type: String, required: true },
    date: { type: Date,
           default: Date.now, required: true },
    Date: { type: String, required: true },
    Heur: { type: String, required: true }
    
  });
const reciever = mongoose.model('reciever', recieverSchema);

var heureInsertion;
var heureEtDate;
var dateHier;
var sec;
var recieved;
var tempe 
var humi
var humiS1
const Time = () =>{
    datHeure = new Date();
    min = datHeure.getMinutes();
    heur = datHeure.getHours(); //heure
    sec = datHeure.getSeconds(); //secondes
    mois = datHeure.getDate(); //renvoie le chiffre du jour du mois 
    numMois = datHeure.getMonth() + 1; //le mois en chiffre
    laDate = datHeure.getFullYear(); // me renvoie en chiffre l'annee
if (numMois < 10) { numMois = '0' + numMois; }
if (mois < 10) { mois = '0' + mois; }
if (sec < 10) { sec = '0' + sec; }
if (min < 10) { min = '0' + min; }
if (heur < 10) { heur = '0' + heur; }
    heureInsertion = heur + ':' + min + ':' + sec;
    heureEtDate = mois + '/' + numMois + '/' + laDate;
    dateHier = (mois-1) + '/' + numMois + '/' + laDate;
//console.log(heureInsertion)
};

const serialPort = new SerialPort({path: "/dev/ttyUSB0", baudRate: 9600});
const {StringStream} = require('scramjet');
serialPort.on('Serial Port open', () => console.log('open'));
var brightness = 'L';
 async function sendData() {
     // the brightness to send for the LED
     
     
     Time();
     if(sec == "00")
     {
      
     if(humiSP1 <= 36){
      x=1;
    console.log('port open');
    // convert the value to an ASCII string before sending it:
    signal='Start Pump'
    console.log('Sending ' + signal + ' out the serial port');
    serialPort.write(signal.toString());
    var Reciever = new reciever();
    Reciever.RecieverNumber = 1;
    Reciever.State = "on";
    Reciever.Date=heureEtDate;
    Reciever.Heur = heureInsertion;    
    MongoClient.connect(url, { useUnifiedTopology: true },function(err, db) {
                    if (err) throw err;
                    console.log("db connected");
                    dbo = db.db("dhtTemp");
    
                dbo.collection("Reciever").insertOne(Reciever, function(err, res) {
                    if (err) throw err;
                    console.log("1 document inserted\n\n");
                    db.close();
                });
             
    }); 
    console.log("I'm going to sleep for 10 second.");
  await sleep(10000);
  console.log('I woke up after 10 second.');
  signal='Stop Pump'
    console.log('Sending ' + signal + ' out the serial port');
    serialPort.write(signal.toString());
    var Reciever = new reciever();
    Reciever.RecieverNumber = 1;
    Reciever.State = "off";
    Reciever.Date=heureEtDate;
    Reciever.Heur = heureInsertion;    
    MongoClient.connect(url, { useUnifiedTopology: true },function(err, db) {
                    if (err) throw err;
                    console.log("db connected");
                    dbo = db.db("dhtTemp");
    
                dbo.collection("Reciever").insertOne(Reciever, function(err, res) {
                    if (err) throw err;
                    console.log("1 document inserted\n\n");
                    db.close();
                });
             
    });
  x=0
}
} 
} 

serialPort.pipe(new StringStream) // pipe the stream to scramjet StringStream
    .lines('\n')                  // split per line
    .each(                        // send message per every line
        data => {recieved = data
        console.log("data from Arduino :" + recieved);
        io.emit('arduino', recieved);
        
        
    //*decoupe des donnees venant de la carte Arduino
    string = recieved.split("*");
    //!
    //io.emit('temp', string);
    temperature = string[0]; //*decoupe de la temperature
    
    humidite = string[1]; //*decoupe de l'humidite
    humiditeSPourcent1 = string[2];
    humiditeS1 = string[3];

    //var  humiditeSPourcent2 = string[4];
    //var  humiditeS2 = string[5];
    
    tempe = parseFloat(temperature);
    io.emit('AirTemp1',tempe)
    humi = parseFloat(humidite);
    io.emit('AirHumi1',humi)
    humiS1 = parseFloat(humiditeS1);
    //io.emit('SolHumiV1',humiS1)
    humiSP1 = parseFloat(humiditeSPourcent1);
    io.emit('SolHumiP1',humiSP1)
    //var humiS2 = parseFloat(humiditeS2);
    //var humiSP2 = parseFloat(humiditeSPourcent2);

    Time();
    //io.emit('Date',heureEtDate);
    //io.emit('Time',heureInsertion);

    //console.log(slave.path('_id'))
    console.log("temp     : " + tempe);
    console.log("hum      : " + humi);
    console.log("humiS  1 : " + humiS1);
    console.log("humiSP 1 : " + humiSP1);
    //console.log("humiS  2 : " + humiS2);
    //console.log("humiSP 2 : " + humiSP2);
    console.log("heur     : " +  heureInsertion);
    console.log("date     : " +  heureEtDate);
    
    var Slave = new slave();
    Slave.Temperature = tempe;
    Slave.Humidity=humi;
    Slave.s1.temperature1 = tempe;
    Slave.s1.humidity1=humi;
    Slave.s1.HumSV1 = humiS1;
    Slave.s1.HumSP1 = humiSP1;
    Slave.s2.temperature2 = tempe;
    Slave.s2.humidity2=humi;
    Slave.s2.HumSV2 = humiS1;
    Slave.s2.HumSP2 = humiSP1;
    Slave.Date=heureEtDate;
    Slave.Heur = heureInsertion;    
    MongoClient.connect(url, { useUnifiedTopology: true },function(err, db) {
                    if (err) throw err;
                    console.log("db connected");
                    dbo = db.db("dhtTemp");
    
                dbo.collection("sender").insertOne(Slave, function(err, res) {
                    if (err) throw err;
                    console.log("1 document inserted\n\n");
                    db.close();
                });
             
    }); 
    
    }
    
    );
    
 
io.on('connection',(socket)=>
    {   
    console.log("connection ") });
    app.use(routes)
    app.get('/index', (req, res) => {
        
      res.render('index');
  });
    app.get('/temoin1', (req, res) => {
        
        res.render('temoin1');
    });

    app.get('/temoin2', (req, res) => {
        
      res.render('temoin2');
  });
    
    // app.get('/js', function(req, res) {
    //     res.sendFile(__dirname + '/js.js');
    // });
    
    server.listen(app.get("port"),function(){    
        console.log("Server Started on port "+ app.get("port"))      
       
    })

 if(x==0)
 {
  setInterval(sendData, 1000);
  
 }
   


