const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Please Enter Your Name"],
        maxlength:[30,"Name cannot exceed 30 characters"],
        minlength:[4,"Name  should have more then 4 charactors"]    
    },
    email:{
        type:String,
        required:[true,"Please Enter Your Email"],
        unique:true,
        validate:[validator.isEmail, "Please Enter a valid Email"]
    },
    password:{
        type:String,
        required:[true, "Please Enter your password"],
        minlength:[8,"passowrd should be greater then 8 characters"],
        select:false,
    },
    avatar:{
       
            public_id:{
            type: String,
            required: true,
            },
            url:{
                type: String,
                required:true
            }
       
    },
    role:{
        type:String,
        default:"user",
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,

});

// for  bcrypt password
userSchema.pre("save", async function(next){
    if(!this.isModified("password")){
        next();
    }
    this.password = await bcrypt.hash(this.password,10);
});
  
//    jwt token 
userSchema.methods.getJWTToken = function(){
    return jwt.sign({id:this._id},process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXPIRE,
    })
}


///      compare password
userSchema.methods.comparePassword = async function(enterdPassword){

    return await bcrypt.compare(enterdPassword, this.password);
}


//   Generating Password reset link-->
userSchema.methods.getResetPasswordToken = function(){
    
    //  Generating Token
    const resetToken = crypto.randomBytes(20).toString("hex");

    //  Hashing and addin resetPasswordToken to userSchema
     this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");

     this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
     return resetToken;
}


module.exports= mongoose.model("user", userSchema);