const express = require('express');
const router = express.Router();
const {User,Product,Order,Membership,Purchase} = require('./DatabaseSchema.js');
const {upload,getUrl,deleteOnce} = require('./Cloud.js');
const passport = require('passport');
require('./auth/google.js');


function requireLogin(req,res,next){
    if(!req.session.email){
        return res.redirect('/creator/signup/page1');
    }
    next();
}

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});


router.get('/auth/google',(req,res,next)=>{
    const type = req.query.type;
    passport.authenticate('google', { scope: ['profile','email'],state : type })(req,res,next);
});
  
 
router.get('/auth/google/callback', (req,res,next)=>{
    passport.authenticate('google', (err,user,info)=>{
        const type = req.query.state;
        if(err||!user){
            if(type=='seller'){
                return res.redirect('/creator/login');
            }else{
                return res.redirect('/buyer/login');
            }
        }
        req.logIn(user,(err)=>{
            if(err) return err;
            req.session.email = req.user.email;
            if(type=='seller'){
                return res.redirect('/creator/signup/page2');
            }else{
                return res.redirect('/dashboard');
            }
        })
    
   })(req,res,next);
}
  
);

router.get('/creator/signup/page1',(req,res)=>{
    return res.render('creator_reg1.ejs',{ existingMessage: "" });
})

router.get('/creator/signup/page2',requireLogin ,async (req,res)=>{
    const userName = await User.findOne({'email': req.session.email},{'userName'  : 1});
    if(userName['userName']){
        return res.redirect('/dashboard');
    }
    return res.render('creator_reg2.ejs');
})
router.get('/checkName/:name',async(req,res)=>{
    try{
        const UserName = req.params.name;
        const username  = await User.findOne({'userName': UserName});
        if(username){
            return res.status(400).send();
        }
        return res.status(200).send();
    }catch(error){
        console.error(error);
        return res.status(500).send("Server error");
    }
     

})

router.get('/creator/signup/page3',requireLogin,async (req,res)=>{
    const Name = await User.findOne({'email':req.session.email});
    res.render('creator_reg3.ejs',{name : Name['name']});
})
router.get('/creator/signup/page4',requireLogin,(req,res)=>{
    res.render('creator_reg4.ejs');
})
router.get('/creator/login',(req,res)=>{
    res.render('creator_login.ejs',{Message: ""});
})
router.get('/buyer/signup/page1',requireLogin,(req,res)=>{
    res.render('buyer_reg1.ejs',{ existingMessage: "" });
})
router.get('/buyer/signup/page2',requireLogin,(req,res)=>{
    res.render('buyer_reg2.ejs');
})
router.get('/buyer/login',requireLogin,(req,res)=>{
    res.render('buyer_login.ejs',{Message: ""});
})
router.get('/signup/api/upload-url',requireLogin, async (req,res)=>{
    const doc = await User.findOne({'email' : req.session.email},{_id : 1});
    const sellerId = doc._id.toString();
    const urlKey = await upload('profile',req.query.type,sellerId,'user');
    const prevUrl = await User.findOne({'email' : req.session.email},{'image' : 1});
    if(prevUrl['image']){
        console.log(prevUrl['image']);
        deleteOnce(prevUrl['image']);
    }
    await User.updateOne({'email':req.session.email},{'image': urlKey['key']});
    res.json(urlKey);
});

router.post('/creator/signup/page1',async (req,res)=>{
    const userName = req.body.fullName;
    const email = req.body.email;
    const password = req.body.password;
    try {
        const existing = await User.findOne({ 'email': email });
        if (existing) {
            // req.body.existing.value = "Email already exists";
            // return res.status(400).send('Email already exists');
            if(req.query.roll == 'seller'){
                return  res.render('creator_reg1.ejs', { existingMessage: "User already exists" });
            }else{
                return  res.render('buyer_reg1.ejs', { existingMessage: "User already exists" });
            }
           
        }else{
            const newUser =  new User({
                name: userName,
                email: email,
                password: password
            });
            await newUser.save();
            req.session.email = email;
            if(req.query.roll == 'seller'){
                return  res.redirect('/creator/signup/page2');
            }else{
                return res.redirect('/dashboard');
            }
            
        }
    } catch (error) {
        console.log(error);
        if(req.query.roll == 'seller'){
                return  res.render('creator_reg1.ejs', { existingMessage: "Please try again" });
            }else{
                return  res.render('buyer_reg1.ejs', { existingMessage: "Please try again" });
            }
        
    }
});



router.post("/creator/signup/page2",requireLogin,async (req,res)=>{
    await User.updateOne({'email':req.session.email},{'profile':req.body.creatorProfile});
    return res.redirect('/creator/signup/page3');
})
router.post("/creator/signup/page3",requireLogin,async (req,res)=>{
    console.log('ji');
    const name = req.body.fullName;
    const userName = req.body.userName;
    const identity = req.body.identity;
    const bio = req.body.bio;
    const lang = req.body.lang;
    
    await User.updateOne({'email':req.session.email},{$set : {
        'name':name, 
        'userName':userName,
        'identity':identity,
        'bio':bio,
        'language':lang,
    }});
    console.log(identity);
    res.redirect('/creator/signup/page4');
})

router.post('/creator/login',async (req,res)=>{

    try{
        const emailObject = await User.findOne({'email' : req.body.email},{'password' : 1});
        if(emailObject){
            if(emailObject['password']===req.body.password){
                req.session.email = req.body.email;
                if(req.query.roll == 'seller'){
                    return  res.redirect('/dashboard');
                }else{
                    return  res.redirect('/dashboard');
                }
                
            }else{
                if(req.query.roll == 'seller'){
                    return res.render('creator_login.ejs',{Message: "Password does not match"});
                }else{
                    return  res.render('buyer_login.ejs',{Message: "Password does not match"});
                }
                
            }
        }else{
            if(req.query.roll == 'seller'){
                    return  res.render('creator_login.ejs',{Message: "Email does not exists"});
                }else{
                    return   res.render('buyer_login.ejs',{Message: "Email does not exists"});
                }
           
        }
    }catch{
        res.status(500).send('Server error');
    }
});

module.exports = router;