import mongoose from "mongoose"

const medicalRecordSchema  =mongoose.Schema({

//make it by your own
  
},{timestamps:true});

export const MedicalRecord  =mongoose.model("MedicalRecord",medicalRecordSchema);