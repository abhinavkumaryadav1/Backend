import mongoose, { mongo } from 'mongoose';
const todoSchema = new mongoose.Schema({

  content: {
    type:String,
    required: true,
  },

  Complete: {
    type: Boolean,
    default:false
  },

  createdBy:{
    //this is written exactly like this because if we want to refrence anything other than the this record we use this to refrence it(these 4 words are exactly a type standerdised by mongoose then we provide the refrence)
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users" //always give ref right after type:, user.models se aya hai ye (name should be same in both file)

  },

  subTodos:[
    {
      type: mongoose.Schema.Types.ObjectId,
      ref:"SubTodo"
    }
  ]

},{timestamps:true})

export const Todo = mongoose.model("Todo", todoSchema)