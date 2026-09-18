const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, '/')));

const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/sharpie_connect";
mongoose.connect(mongoURI).then(()=>console.log("DB Connected")).catch(err=>console.error(err));

const UserSchema = new mongoose.Schema({
  telegramId:{type:String,unique:true},
  username:String,
  role:{type:String,enum:['user','provider','admin'],default:'user'},
  providerType:{type:String,enum:['hookup','svc','both']},
  coinBalance:{type:Number,default:0},
  walletStars:{type:Number,default:1000},
  escrowStars:{type:Number,default:0},
  verificationStatus:{type:String,enum:['none','pending','approved','rejected'],default:'none'},
  verificationVideoUrl:String,
  profilePhotos:[String],
  bio:String,
  location:String,
  isVerifiedProvider:{type:Boolean,default:false},
  priceMeetup:{type:Number,default:500},
  priceVideo:{type:Number,default:300},
  lastMiningTime:{type:Date,default:null}
});

const User = mongoose.model('User',UserSchema);

app.post('/api/user/sync', async (req,res)=>{
  const {telegramId,username}=req.body;
  let user = await User.findOne({telegramId});
  if(!user){user=new User({telegramId,username}); await user.save();}
  res.json({success:true,data:[STRIPPED]
});

app.post('/api/mine/start', async (req,res)=>{
  const {telegramId}=req.body;
  let user = await User.findOne({telegramId});
  if(!user) return res.status(400).json({success:false});
  user.coinBalance+=10;
  user.lastMiningTime=new Date();
  await user.save();
  res.json({success:true,coinBalance:user.coinBalance});
});

app.post('/api/escrow/book', async (req,res)=>{
  const {telegramId,bookingType,cost}=req.body;
  let user = await User.findOne({telegramId});
  if(!user || user.walletStars<cost) return res.status(400).json({success:false,message:"Not enough Stars"});
  user.walletStars-=cost;
  user.escrowStars+=cost;
  await user.save();
  res.json({success:true,message:bookingType+" booked! "+cost+" Stars locked in escrow"});
});

app.post('/api/verify/upload', async (req,res)=>{
  const {telegramId,videoUrl}=req.body;
  await User.findOneAndUpdate({telegramId},{verificationVideoUrl:videoUrl,verificationStatus:'pending'});
  res.json({success:true,message:"Video sent to admin"});
});

app.get('/api/providers/list', async (req,res)=>{
  const providers = await User.find({role:'provider',verificationStatus:'approved'});
  res.json(providers);
});

app.get('/api/admin/pending', async (req,res)=>{
  const pending = await User.find({verificationStatus:'pending'});
  res.json(pending);
});

app.post('/api/admin/approve', async (req,res)=>{
  const {targetId,approve}=req.body;
  const status = approve?'approved':'rejected';
  await User.findOneAndUpdate({telegramId:targetId},{verificationStatus:status,isVerifiedProvider:approve?true:false});
  res.json({success:true});
});

app.post('/api/provider/signup', async (req,res)=>{
  const {telegramId,providerType,bio,location,priceMeetup,priceVideo,photos}=req.body;
  await User.findOneAndUpdate({telegramId},{role:'provider',providerType,bio,location,priceMeetup,priceVideo,profilePhotos:photos});
  res.json({success:true,message:"Provider profile created"});
});

app.get('/api/adsgram/reward',(req,res)=>{res.send("OK");});

const PORT = process.env.PORT || 10000;
app.listen(PORT,()=>console.log("Running on "+PORT));
