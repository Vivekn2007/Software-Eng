const express = require('express');
const {User,Product,Order,Membership,Purchase} = require('./DatabaseSchema.js');
const router = express.Router();
const {upload,getUrl} = require('./Cloud.js');
const product= {"name": "Vivek Narayan","view":"0","sale":"100",'symbol':'V'};
const slugif = require('slugify');

function generateSlug(name){
    let slug = slugif(name,{
        lower:true,
        strict : true,
        trim : true
    })
    const existing = Product.find({slug});
    if(existing){
        slug = `${slug}-${Date.now()}`;
    }
    return slug;
}

router.get('/page1',async (req,res)=>{

    res.render('Membership_page1.ejs',product);
})
router.get('/page2/:id',(req,res)=>{
    req.session.productSlug = req.params.id;
    res.render('Membership_page2.ejs',product);
})
router.get('/page3',(req,res)=>{
    
    res.redirect(`/membership/page3/${req.session.productSlug} `);
})

router.get('/page3/:id',(req,res)=>{
    
    res.render('Membership_page3.ejs',product);
})

router.post('/page1',async (req,res)=>{
    const doc = await User.findOne({'email':req.session.email},{_id:1});
    const membershipObj = {
        'sellerId' : await doc._id.toString(),
        'tierName' : req.body.title
    }
    await Membership.create(membershipObj);
    const MemberDoc = await Membership.findOne({'tierName':req.body.title},{_id:1});
    const slug = generateSlug(req.body.title);
    const product = {
        'sellerId' : await doc._id.toString(),
        'title' : req.body.title,
        'accessType' : 'membership',
        'sourceId' : await MemberDoc._id.toString(),
        'slug' : slug
    }
    await Product.create(product);
    const productId = await Product.findOne({'slug':slug},{id : 1});
    const id = await productId._id.toString();
    
    res.redirect(`/membership/page2/${id}`);
})


router.get('/api/get-url',async (req,res)=>{
    const membershipID = await Product.findById(req.session.productSlug);
    const membershipData = await Membership.findById(membershipID['sourceId']);
    const fileKeyObject = await membershipData['fileKey'];
    const urlObject = [];
    for(let ele of fileKeyObject){
        let list  = []
        const url  = await getUrl(ele['key']);  
        list.push(ele['title']);
        list.push(url);
        list.push(ele['date']);
        list.push(ele['type']);
        urlObject.push(list);
    }
    
    res.json(urlObject); 
})

router.get('/api/upload-url',async (req,res)=>{
    const doc = await User.findOne({email : req.session.email},{_id:1});
    const urlKey = await upload(req.query.filename,req.query.type , doc._id.toString(),'membership');
    const productId = await Product.findById(req.session.productSlug);
    const title = req.query.filename;
    const element = { 'title' : title , 'key' : urlKey['key'] , 'date' : Date.now(),'type': req.query.type};
    await Membership.updateOne(
        {_id : productId['sourceId'] },
        {$push : {'fileKey' : element}}
    );
    res.json(urlKey);
})
module.exports = router;