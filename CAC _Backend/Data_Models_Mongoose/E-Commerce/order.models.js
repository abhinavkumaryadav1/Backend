import mongoose from 'mongoose';

const orderItemSchema = mongoose.Schema({

  productId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Product"
  },
  
  quantity:{
    type:Number,
    required:true
  }
  
});


const orderSchema = mongoose.Schema({

orderPrice:{
  type:Number,
  required:true,
},

customer:{
  type:mongoose.Schema.Types.ObjectId,
  ref:"User"
},

orderItems:{
  type:[orderItemSchema] // we have made another schema in the same file for this because we wanted : [{but with diff props}]. we can do itdiffrently like in subtodo.model.js look into it.
},

address:{
  type:String,
  required:true,
},

status:{
  type:String,
  enum:["PENDING","CANCELLED","DELIVERED"], //the status can be onlu picked up from enum not naything else not even speling mistake.
  default:"PENDING"
}

},{timestamps:true})

export const Order = mongoose.model("Order",orderSchema);