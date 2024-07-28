import mongoose from "mongoose";

const feeSchema=new mongoose.Schema({
    "First Year" :{
        type:Number,
        required:true
    },
    "Second Year" :{
        type:Number,
        required:true
    },
    "Third Year" :{
        type:Number,
        required:true
    },
    "Fourth Year" :{
        type:Number,
        required:true
    },
})

export default mongoose.model("fee",feeSchema)