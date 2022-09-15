const mongoose = require("mongoose");
const {UserAccount} = require("../model/userModel")
const Schema = require('mongoose').Schema;


const  auditLogSchema= new mongoose.Schema({
        User_ID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'UserAccount',
            default: null
        },
        time: {
            type : Date,
            default : Date.now()
        },
        url: {
            type : String,
           
        },
        method : {
            type : String,
        },
        statusCode: { 
            type: String
        },
        oldItem :{
            type: Schema.Types.Mixed,
        },
        newItem :{
            type: Schema.Types.Mixed,
        },
        
        
});


let AuditLog = mongoose.model("AuditLog", auditLogSchema);
module.exports =  {AuditLog};