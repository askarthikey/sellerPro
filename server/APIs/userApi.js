const express = require("express");
const userApp = express.Router();
const dotenv = require("dotenv");
const expressAsyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const bcryptjs = require("bcryptjs");
const { ObjectId } = require("mongodb");

dotenv.config();

userApp.use((req, res, next) => {
  const usersCollection = req.app.get("usersCollection");
  req.usersCollection = usersCollection;
  next();
});

// Authentication middleware
const verifyToken = expressAsyncHandler(async (req, res, next) => {
  try {
    // Get token from the Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: "No token provided, access denied" });
    }
    
    // Extract the token
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    
    // Find user from database
    const usersCollection = req.usersCollection;
    const user = await usersCollection.findOne({ username: decoded.username });
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Check if user is blocked
    if (user.isBlocked === "true") {
      return res.status(403).json({ message: "Your account has been blocked. Please contact admin." });
    }
    
    // Add user info to request
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token, authentication failed" });
  }
});

// Admin authentication middleware
const verifyAdmin = expressAsyncHandler(async (req, res, next) => {
  // User must be authenticated first
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  if (req.user.isAdmin !== "true") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
});

// Public routes (no authentication required)
userApp.post(
  "/signup",
  expressAsyncHandler(async (req, res) => {
    const newUser = req.body;
    const usersCollection = req.usersCollection;
    const dbUser = await usersCollection.findOne({
      username: newUser.username,
    });
    if (dbUser != null) {
      res.status(409).json({message:"User already exists!!"});
    } else {
      const hashedPass = await bcryptjs.hash(newUser.password, 6);
      newUser.password = hashedPass;
      await usersCollection.insertOne(newUser);
      res.status(201).json({ message: "User created successfully" });
    }
  }),
);

userApp.post("/signin",expressAsyncHandler(async(req,res)=>{
  const userCred=req.body
  const usersCollection=req.usersCollection
  const dbUser= await usersCollection.findOne({username:userCred.username})
  if(dbUser===null){
    res.send({ message: "Invalid Credentials - User not found in DB"})
  }
  else if(dbUser.isBlocked==="true"){
   res.send({message:"You have been blocked. Please contact admin for more details!!"}) 
  }
  else{
    const status=await bcryptjs.compare(userCred.password,dbUser.password)
    if(status===false){
      res.send({message:"Incorrect Password!! Please try again"})
    }
    else{
      const signedToken = jwt.sign({username:dbUser.username},process.env.SECRET_KEY)
      res.send({message:"Login Successful!!",token:signedToken,user:dbUser})
    }
  }
}))



module.exports = userApp;
