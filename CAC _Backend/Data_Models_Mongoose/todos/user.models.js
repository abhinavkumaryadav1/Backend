import mongoose from "mongoose"

const userSchema = new mongoose.Schema({

  usrname: {
    type: String,// mongoose features eaither directly apply the type or put ints properties in {}
    required: true,
    unique:true,
    lowercase: true
  },
  email: {

    type: String,
    required: true,
    unique: true,
    lowercase: true,
     },
  password: {

    type:String,
    required:true
  }

}
,{timestamps:true}) //craeted at & updated at - put and managed by default

export const User = mongoose.model("User", userSchema)// mongodb directly make the user plural "users" and in lower case