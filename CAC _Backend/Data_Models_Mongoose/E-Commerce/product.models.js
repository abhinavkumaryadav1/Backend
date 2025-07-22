import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({

  description:{
    type:String,
    required:true,

  },

name:{
  type:String,
  required:true,
},

productImage:{
  type:String, //Because if we store image as fuffer on the server it will be laggy thats why we store it in database bucket and fetch url.
  required:true
},

prices:{
  type:Number,
  default:0,
  required:true
},

stock:{
  type:Number,
  required:true,
  default:0 
},
category:{
  type:mongoose.Schema.Types.ObjectId,
  ref:"Category",
  required:true
},

owner:{

  type:mongoose.Schema.Types.ObjectId,
  ref:"User"

}

},{timestamps:true})

export const Product = mongoose.model("Product",productSchema);