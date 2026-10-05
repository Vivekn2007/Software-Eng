require("dotenv").config();
const express = require("express");
const { dirname } = require("path");
const app = express();
const path = require("path");
const mongoose = require('mongoose');
// mongoose.connect(process.env.MONGODB_URI)
// .then(()=>{
//     console.log('MongoDB connected successfully');
// }).catch((e)=>{
//     console.log(e);
// })

publicPath = path.join(__dirname,"./public");

app.use(express.static(publicPath));
app.set('view engine','ejs');

// app.get('/',(req,res)=>{ 
//     const product={'symbol':'V'};
//     res.render("navbar",product);   
// }) 
const product= {"name": "Vivek Narayan","view":"0","sale":"100",'symbol':'V'}
app.get('/dashboard',(req,res)=>{
    const user={'name':'Vivek Narayan','symbol':'V','sales':'2000','order':20,'nord':'4','view':2000,'perc':12,'product':20,'publish':5};
    res.render('dashboard.ejs',user);
})

app.get('/addProduct',(req,res)=>{
    res.render('addProduct.ejs',product);
})

app.get('/analytic',(req,res)=>{
   
    res.render('analytics.ejs',product);
})

app.get('/product',(req,res)=>{
    
    res.render('product.ejs',product);
})
app.get('/prodetails',(req,res)=>{
    
    res.render('productsCart.ejs',product);
}) 

app.get('/customer',(req,res)=>{
    res.render('customer',product);
})

app.get('/settings',(req,res)=>{
    res.render('settings',product);
})


app.listen(3000,()=>{
    console.log("listenning at 3000");
})  


