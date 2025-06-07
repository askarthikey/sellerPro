const express = require("express");
const productsApp = express.Router();
const dotenv = require("dotenv");
const expressAsyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");

dotenv.config();

productsApp.use((req, res, next) => {
  const productsCollection = req.app.get("productsCollection");
  req.productsCollection = productsCollection;
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
    const usersCollection = req.app.get("usersCollection");
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

// Add product route
productsApp.post(
  "/addProduct",
  verifyToken,
  expressAsyncHandler(async (req, res) => {
    try {
      const { productName, price, category, stock, description, imageUrl } = req.body;
      
      if (!productName || !price || !category || !stock) {
        return res.status(400).json({ message: "Missing required product information" });
      }
      
      const productsCollection = req.productsCollection;
      
      const newProduct = {
        productName,
        price: parseFloat(price),
        category,
        stock: parseInt(stock),
        description: description || "",
        imageUrl: imageUrl || "",
        seller: req.user.username,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const result = await productsCollection.insertOne(newProduct);
      
      if (result.acknowledged) {
        res.status(201).json({ 
          message: "Product added successfully",
          productId: result.insertedId
        });
      } else {
        res.status(500).json({ message: "Failed to add product" });
      }
    } catch (error) {
      console.error("Error adding product:", error);
      res.status(500).json({ message: "Server error adding product" });
    }
  })
);

// Get seller's products
productsApp.get(
  "/myProducts",
  verifyToken,
  expressAsyncHandler(async (req, res) => {
    try {
      const productsCollection = req.productsCollection;
      
      // Get products for the current user
      const products = await productsCollection
        .find({ seller: req.user.username })
        .sort({ createdAt: -1 }) // Most recent first
        .toArray();
      
      res.status(200).json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Server error fetching products" });
    }
  })
);

// Get product by ID
productsApp.get(
  "/product/:id",
  verifyToken,
  expressAsyncHandler(async (req, res) => {
    try {
      const productsCollection = req.productsCollection;
      const productId = req.params.id;
      
      if (!ObjectId.isValid(productId)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      
      const product = await productsCollection.findOne({ 
        _id: new ObjectId(productId) 
      });
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      // Check if user is the seller of this product
      if (product.seller !== req.user.username) {
        return res.status(403).json({ message: "You do not have access to this product" });
      }
      
      res.status(200).json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Server error fetching product" });
    }
  })
);

// Update product
productsApp.put(
  "/product/:id",
  verifyToken,
  expressAsyncHandler(async (req, res) => {
    try {
      const productsCollection = req.productsCollection;
      const productId = req.params.id;
      
      if (!ObjectId.isValid(productId)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      
      // Check if product exists and belongs to user
      const existingProduct = await productsCollection.findOne({
        _id: new ObjectId(productId)
      });
      
      if (!existingProduct) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      if (existingProduct.seller !== req.user.username) {
        return res.status(403).json({ message: "You do not have permission to update this product" });
      }
      
      const { productName, price, category, stock, description, imageUrl } = req.body;
      
      // Update the product
      const updatedProduct = {
        $set: {
          productName: productName || existingProduct.productName,
          price: price ? parseFloat(price) : existingProduct.price,
          category: category || existingProduct.category,
          stock: stock !== undefined ? parseInt(stock) : existingProduct.stock,
          description: description !== undefined ? description : existingProduct.description,
          imageUrl: imageUrl || existingProduct.imageUrl,
          updatedAt: new Date()
        }
      };
      
      const result = await productsCollection.updateOne(
        { _id: new ObjectId(productId) },
        updatedProduct
      );
      
      if (result.modifiedCount === 1) {
        res.status(200).json({ message: "Product updated successfully" });
      } else {
        res.status(500).json({ message: "Failed to update product" });
      }
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ message: "Server error updating product" });
    }
  })
);

// Delete product
productsApp.delete(
  "/product/:id",
  verifyToken,
  expressAsyncHandler(async (req, res) => {
    try {
      const productsCollection = req.productsCollection;
      const productId = req.params.id;
      
      if (!ObjectId.isValid(productId)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      
      // Check if product exists and belongs to user
      const existingProduct = await productsCollection.findOne({
        _id: new ObjectId(productId)
      });
      
      if (!existingProduct) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      if (existingProduct.seller !== req.user.username) {
        return res.status(403).json({ message: "You do not have permission to delete this product" });
      }
      
      const result = await productsCollection.deleteOne({
        _id: new ObjectId(productId)
      });
      
      if (result.deletedCount === 1) {
        res.status(200).json({ message: "Product deleted successfully" });
      } else {
        res.status(500).json({ message: "Failed to delete product" });
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Server error deleting product" });
    }
  })
);

module.exports = productsApp;