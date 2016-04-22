/// <reference path="typings/node/node.d.ts" />
/// <reference path="typings/express/express.d.ts" />

import express=require('express');
var app=express();
var mongoose=require('mongoose');
var path=require('path');
var fs=require('fs');
var bodyParser=require('body-parser');
// create reusable transport method (opens pool of SMTP connections)
var nodemailer = require('nodemailer');

// create reusable transporter object using the default SMTP transport
var transporter = nodemailer.createTransport('smtps://pkbscs67@gmail.com:parkashkumar67@smtp.gmail.com');


//connection string
var dburi="mongodb://127.0.0.1/carDetection";
mongoose.connect(dburi);
//verifying connection
mongoose.connection.on('connected',function () {
    console.log("Database connected");
});
mongoose.connection.on('error',function (err) {
    console.log("Error in db connection:\n"+err);
});

//Database schema
var car=mongoose.Schema({
    "firstname":{type:String,required:true},
    "lastname":{type:String,required:true},
    "nic":{type:Number,required:true,unique:true},
    "licenseNumber":{type:String,required:true,unique:true},
    "contactNumber":{type:Number,required:true},
    "city":{type:String,required:true},
    "email":{type:String},
    "address":{type:String,required:true},
    "status":{type:String,default:"Registered"},
    "createdOn":{type:Date,default:Date.now()}    
})

var trackCar=mongoose.Schema({
    "plateNumber":{type:String},
    "status":{type:String },
    "createdOn":{type:Date,default:Date.now()} ,
})
//Database Model

var liscenseNumber=mongoose.model('liscenseNumber',car); 
var AuthorizedCar=mongoose.model('AuthorizedCar',trackCar);

//view engine
app.set('views',path.join(__dirname,'/views'));
app.set('view engine','ejs');

//middlewares
app.use(express.static(path.join(__dirname,'/public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

 fs.readFile('numberPlate.txt',function (err,filedata) {
        if(err)console.log("Error in file reading: \n"+err);
        else{ 
            if(filedata.toString()!=''){
                var num:string=(filedata.toString())
                num=num.replace(/(\r\n|\n|\r)/gm,"");
                console.log("file:"+num);
            liscenseNumber.find({"licenseNumber":num.trim()},function(err,data){
                var num=filedata.toString()
                 num=num.replace(/(\r\n|\n|\r)/gm,"");
                if(err)console.log("Error on car entrance: \n"+err);
                else{
                    if(data.length==0){
                        console.log("Car not found:\n"+num);
                        var carStack=new AuthorizedCar({
                            "plateNumber":num,
                             "status":"Unregistered",
                            "createdOn":Date.now() ,
                        }).save(function(err,data){
                            var result=data;
                            
                            
                            
                            if(err)console.log("Error to maintain data of unregistered car: \n"+err);
                            else{
                                console.log("Data saved in carStack of unregistered car: \n"+data);
                                 var mailOptions = {
                                 from: "RedZone Security Systems  pkbscs67@gmail.com", // sender address
                                 to: "pk_bscs@yahoo.com", // list of receivers
                                 subject: "Alert...Unregistered car detected", // Subject line
                                 text:"Unregistered car of number is: "+data.plateNumber
                                      // plaintext body
                                // html body
                                }

// send mail with defined transport object
// send mail with defined transport object
        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                 return console.log(error);
                 }
            console.log('Message sent: ' + info.response);
        });
                            }
                        })
                    }
                    else{
                        console.log(data);
                        for(var i=0;i<data.length;i++){
                         var carStack=new AuthorizedCar({
                            "plateNumber":data[i].licenseNumber,
                             "status":data[i].status,
                            "createdOn":Date.now() ,
                        }).save(function(err,data){
                            if(err)console.log("Error to maintain data of registered car: \n"+err);
                            else{
                                console.log("Data saved in carStack of registered car: \n"+data);
                               
                            }
                        })
                        }
                    }
                }
            })
            console.log("File read: \n"+filedata);
        }}
    })

app.get('/',function(req,res){
    AuthorizedCar.find({},function(err,data){
        if(data.length==0){
            res.render('home',{logs:JSON.stringify(" ")});
        }
        else{
            res.render('home',{logs:JSON.stringify(data)});
        }
    })
 
});

//fetch data
app.get('/fetch',function(req,res){
   AuthorizedCar.find({},function(err,data){
        if(err){
            console.log(err);
        }
        else{
            // res.send("helo");
            AuthorizedCar.find({"status":"Unregistered"},function(err,data){
                if(data.length==0){ console.log("first phase: No invalid car");}
                else{
                for(var i=0;i<data.length;i++){
                    console.log(data[i].plateNumber);
                    liscenseNumber.find({"licenseNumber":(data[i].plateNumber).trim()},function(err,data){
                        if(data.length==0){console.log("No invalid car" +data);}
                        else{
                            for(var i=0;i<data.length;i++){
                               AuthorizedCar.update(
                                            { "status":"Unregistered"},
                                         { $set:
                                                { 
                                                   "status":"Registered",
                                                 }
                                         }
                        ,function (err,data) {
                                         if(err)console.log("Update: "+err);
                                             else console.log( data);
                                })
                            }
                        }
                        
                    })
                }
            }
            })
             res.send(JSON.stringify(data));
            // res.json(data);
             }
       
    })
   
})
//Registration of car request
app.post('/',function (req,res) {
   var car_entry=new liscenseNumber({
    "firstname":req.body.firstname,
    "lastname":req.body.lastname,
    "nic":req.body.nic,
    "licenseNumber":req.body.licensenumber,
    "contactNumber":req.body.contactnumber,
    "city":req.body.city,
    "email":req.body.email,
    "address":req.body.address,
    "status":"Registered",
    "createdOn":Date.now()    
   }).save(function(err,data){
       if(err)console.log("Data is not inserted: \n"+err);
       else{
           console.log("Data inserted: \n"+data);
           var result=JSON.stringify(data);
           var mailOptions = {
                                 from: "RedZone Security Systems  pkbscs67@gmail.com", // sender address
                                 to: "pk_bscs@yahoo.com", // list of receivers
                                 subject: "New Registration", // Subject line
                                 text:"firstname: "+req.body.firstname+"\n"
                                      +"lastname: "+req.body.lastname+"\n"
                                      +"NIC: "+req.body.nic+"\n" 
                                      +"licenseNumber: "+req.body.licensenumber+"\n"
                                      +"contactNumber: "+req.body.contactnumber+"\n"
                                      +"city: "+req.body.city+"\n"
                                      +"email: "+req.body.email+"\n"
                                      +"address: "+req.body.address+"\n"   
                                      // plaintext body
                                // html body
                                }

// send mail with defined transport object
// send mail with defined transport object
        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                 return console.log(error);
                 }
            console.log('Message sent: ' + info.response);
        });
          res.redirect('/'); 
        
       }
   })
 
});

app.get("/enteries",function(req,res) {
    liscenseNumber.find({},function(err,data){
        if(err)console.log("Error in fetching enteries: \n"+err);
        else{
            if(data.length==0){
                res.render("registeredCar",{enteries:JSON.stringify(" ")});
            }
            else{
                res.render("registeredCar",{enteries:JSON.stringify(data)});
            }
        }
    })
    
})

app.get("/refresh",function(req,res) {
    liscenseNumber.find({},function(err,data){
        if(err)console.log("Error in refreshing enteries: \n"+err);
        else{
            if(data.length==0){
                res.send(JSON.stringify(" "));
            }
            else{
                res.send(JSON.stringify(data));
            }
        }
    })
    
})


app.get('/delete',function(req,res){
    console.log(req.query.id);
    liscenseNumber.remove({"_id":req.query.id},function(err,data){
        if(err){console.log("Delete: "+err)}
        else{console.log("Delete"+data) };
        res.end();
    })
  
})

app.get('/cam',function(req,res){
   res.render('camera');
  
})

app.get('/clear',function(req,res){
    AuthorizedCar.remove({},function(err,data){
       if(err){
           console.log("You cannot delete logs");
       }
       else{
           console.log("Logs cleared"); 
           res.redirect('/');
       }
    })
})
var port:number=process.env.PORT||3000;
var server=app.listen(port,function() {
    var listening=server.address().port;
    console.log("Server is listening at port: "+listening);
});
