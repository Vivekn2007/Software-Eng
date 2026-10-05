const mongoose = require('mongoose');
const findOrCreate = require('mongoose-findorcreate');
mongoose.connect(process.env.MONGODB_URI)
.then(()=>{
    console.log('Successfully connected the database ');
})
.catch((e)=>{
    console.log(e);
})

const userSchema = mongoose.Schema({
    email : {
        type: String,
        required : true,
        unique : true
    },
    password : {
        type: String,
        required : function() {
            return !this.googleId; // require password only if no Google login
            }
    },
    name : {
        type : String,
        required : true
    },
    userName : {
        type : String
    },
    identity : {
        type : String
    },
    bio : {
        type : String
    },
    language : {
        type : [String]
    },
    image : {
        type : String
    },
    profile :{
        type:  String
    },
    roll : {
        type : String,
        enum : ['buyer','seller','both'],
        
    },
    googleId : {
        type : String
    },
    razorpayId : {
        type: String
    },
    createdAt : {
        type : Date,
        default : Date.now
    }
});
userSchema.plugin(findOrCreate);
const productSchema  = mongoose.Schema({
    sellerId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : true
    },
    title : {
        type : String,
        required : true
    },
    slug : {
        type : String
    },
    accessType: {
        type : String,
        enum : ['membership','product']
    },
    sourceId : {
        type : mongoose.Schema.Types.ObjectId,
        refPath: 'accessType',

    },
    price : {
        type : Number
    },
    currency : {
        type : String,
        default : 'inr'
    },
    isPublished : {
        type : Boolean,
        default : false
    },
    createdAt : {
        type : Date,
        default : Date.now
    }
});

const orderSchema = mongoose.Schema({
    buyerId : {
        type : mongoose.Schema.Types.ObjectId,
        ref  : 'User',
        required : true
    },
    productId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Product',
        required : true
    },
    sellerId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : true
    },
    buyerEmail : {
        type : String,
        required : true
    },
    amount : {
        type : Number,
        required : true
    },
    currency : {
        type : String,
        default : 'inr',
    },
    status : {
        type : String,
        enum : ['pending','completed','refunded']
    },
    razorpayId : {
        type : String
    },
    downloadToken : {
        type : String
    },
    tokenExpiersAt : {
        type : Date
    },
    createdAt : {
        type : Date,
        default : Date.now
    }
});

const membershipSchema = mongoose.Schema({

    sellerId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : true
    },
    razorpayCustomerId : {
        type : String
    },
    razorpaySubscriptionId : {
        type : String
    },
    status :{
        type : String,
        enum : ['active','cancelled','post_due'],
        default : 'post_due'
    },
    tierName : {
        type : String
    },
    fileKey : {
        type : [Object]
    },
    coverImgKey : {
        type : String
    },
    currentPeriodStart : {
        type : Date
    },
    currentPeriodEnd : {
        type : Date
    },
    cancelled : {
        type : Date
    },
    createdAt : {
        type : Date,
        default : Date.now
    }
});

const purchaseSchema = mongoose.Schema({
    buyerId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : true
    },
    productId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Product',
        required : true
    },
    sellerId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : true
    },
    accessType : {
        type : String,
        enum : ['membership','product']
    },
    sourceId : {
        type : mongoose.Schema.Types.ObjectId,
        refPath: 'accessType'
    },
    status : {
        type : String,
        enum : ['active','revoked','expires'],
        default : 'active'
    },
    grantedAt : {
        type : Date,
        default : Date.now
    },
    expiresAt : {
        type : Date
    }
});

const User = mongoose.model('User',userSchema);
const Product = mongoose.model('Product',productSchema);
const Order = mongoose.model('Order',orderSchema);
const Membership = mongoose.model('Membership',membershipSchema);
const Purchase = mongoose.model('Purchase',purchaseSchema);

module.exports = {User,Product,Order,Membership,Purchase};