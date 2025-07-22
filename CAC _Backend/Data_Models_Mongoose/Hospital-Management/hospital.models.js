import mongoose from "mongoose"

const hospitalSchema  =mongoose.Schema({

name:{
  type:string,
  required:true,
},

addressLine1:{
  type:string,
  required:true,
},

addressLine2:{
  type:string,
},

city:{
  type:string,
  required:true,
},

pinCode:{
  type:String,
  required:true,
},

specialisedIn:[
  {
    type:String,
  }
],

},{timestamps:true});

export const Hospital  =mongoose.model("Hospital", hospitalSchema);