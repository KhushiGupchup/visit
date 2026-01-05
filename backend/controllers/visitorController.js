const Visitor = require("../models/Visitor");
const Employee = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

//For Visitor Login
exports.loginVisitor = async(req,res)=>{
    try{
        const{email,password}=req.body;

        if(!email){
            return res.status(400).json({msg:"email is empty.please enter"});
        }
        if(!password){
            return res.status(400).json({msg:"Password is empty.please enter"});

        }

        const visitorlogin = await Visitor.findOne({email:email});

        if(!visitorlogin){
            return res.status(404).json({msg:"Visitor is not found"});
        }

        const isMatch = await bcrypt.compare(password,visitorlogin.password);

        if(!isMatch){
            return res.status(400).json({msg:"Invalid password."});
        }

        const token = jwt.sign({
            id:visitorlogin._id,
            role:"visitor",
            email:visitorlogin.email
        },
        process.env.JWT_SECRET,
        {expiresIn:"1d"});

        res.json({
            msg:"Login is successful",token,role:"visitor",
            email:visitorlogin.email,
            name:visitorlogin.name,
            phone:visitorlogin.phone
        });
    }
    catch(err){
        console.error("Error in Login",err);
        res.status(500).json({msg:"Server Error"});
    }
};

//register visitor by form

exports.registerVisitorForm = async(req,res)=>{
    try{
        const{name,email,phone,hostEmpId,purpose,scheduledAt,slot}=req.body;

        if(!name || !email || !phone ||!hostEmpId ||!purpose ||!scheduledAt ||!slot ){
            return res.status(400).json({msg:"Please fill all the values"});
        }
       

        const hostId = await Employee.findOne({empId:Number(hostEmpId)});

        if(!hostId){
            return res.status(404).json({msg:"Employee is not present"});

        }

        const allowedSlots = ["slot1","slot2","slot3"];
        const selectedSlot = allowedSlots.includes(slot) ? slot :"other time";

        const visitorinfo ={
            name,email:email,phone,hostEmpId:Number(hostEmpId),
            hostName:hostId.name,purpose,scheduledAt,
            slot:selectedSlot,status:"pending",
            photo:req.file ? req.file.filename :null
        };

        const newVisitor = await Visitor.create(visitorinfo);

        res.status(201).json({msg:"Visitor is registered successfully",data:newVisitor});


    }
    catch(err){
        console.error("Error in form while registering",err);
        res.status(500).json({msg:"Server Error"});
    }
};

//visitor visits
exports.getMyVisits =async(req,res)=>{
    try{
        const visitorEmail = req.visitor.email;

        const visit = await Visitor.find({email:visitorEmail}).sort({scheduledAt:-1});

        const info = await Promise.all(visit.map(async(v)=>{
            let hostName = v.hostName;

            if(!hostName){
                const host = await Employee.findOne({empId:v.hostEmpId});
                hostName=host?host.name: "Employee";
            }
            return{
                _id:v._id,name:v.name,email:v.email,phone:v.phone,
                purpose:v.purpose,status:v.status,scheduledAt:v.scheduledAt,
                slot:v.slot,qrData:v.qrData,hostEmpId:v.hostEmpId,hostName,
                photo:v.photo || null
            };
        }));
        res.json(info);
    }
    catch(err){
        console.error("Visits Error:",err);
        res.status(500).json({msg:"Error while fetching your visits"});
    }
};

//add Visitor  through employee

exports.addVisitor=async(req,res)=>{
    try{
        const visitor=req.visitor;//jwt
        const host=await Employee.findOne({empId:Number(req.body.hostEmpId)});

        if(!host){
            return res.status(404).json({msg:"Employee not found"});

        }
        const allowedSlots = ["slot1", "slot2", "slot3"];
        let slot = allowedSlots.includes(req.body.slot) ? req.body.slot : "other";

        const visitorData={
            name:req.body.name,
            email:visitor.email,
            phone:req.body.phone,
            hostEmpId: Number(req.body.hostEmpId),
            hostName:host.name,
            purpose:req.body.purpose,
            scheduleAt:req.body.scheduleAt,
            slot,
            status:"pending",
            photo:req.file?req.file.filename:visitor.photo || null,
        };

        const newVisit= await Visitor.create(visitorData);
        console.log(newVisit);
        res.status(201).json({msg:"Your visit is scheduled successfully",data:newVisit});

    }
    catch(err){
        console.error("Error to schedule your visit",err);
        res.status(500).json({msg:"Server Error"});
    }
};