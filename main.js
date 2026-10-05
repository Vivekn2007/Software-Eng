require("dotenv").config();
const express = require("express");
const { dirname } = require("path");
const app = express();
const path = require("path");
const {User,Product,Order,Membership,Purchase} = require('./src/routes/DatabaseSchema.js');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const membershipRoutes = require('./src/routes/membership.js');

const loginRoutes = require('./src/routes/Login.js');
const passport = require('passport')
publicPath = path.join(__dirname,"./public");
app.use(express.urlencoded({extended : true}));
app.use(express.json());
app.use(express.static(publicPath));
app.set('view engine','ejs');

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    // This allows the session store to wait for the DB to be ready
    mongoOptions: { 
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 10000 
    }
  })
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/membership',membershipRoutes);
app.use('',loginRoutes);
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

//checking payment checkout
app.get('/test-checkout', (req, res) => {
    res.render('test-checkout.ejs');
});

const paymentRoutes =
require("./src/routes/paymentRoutes");

app.use(express.json());

app.use("/payment", paymentRoutes);




app.listen(3000,()=>{
    console.log("listenning at 3000");
})  