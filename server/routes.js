var express = require('express')


var router = express.Router()
 router.get('', (req,res)=>{
    //console.log("hello fuck off")  
    
    res.render("index")
 })

module.exports = router