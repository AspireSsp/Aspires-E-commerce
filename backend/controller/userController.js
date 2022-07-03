const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const User = require("../models/userModel");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");

//     register a user 
exports.registerUser = catchAsyncErrors( async(req,res,next)=>{
    const {name,email,password} = req.body;

    const user = await User.create({
        name,email,password,
        avatar:{
            public_id:"this is a sample id",
            url:"profilepicUrl",
        }
    });

    sendToken(user,201,res);
    
});



// LOgin the user 
exports.loginUser = catchAsyncErrors( async(req,res,next)=>{ 


    const {email, password} = req.body;

    //  checking if user has given password and email
    if(!email || !password){
        return next(new ErrorHandler("please Enter email & password", 400));
    }

    const user = await User.findOne({email}).select("+password");

    if(!user){
        return next(new ErrorHandler("Invailid Email or password", 401))
    }

    const isPasswordMatched = await user.comparePassword(password);

    if(!isPasswordMatched){
        return next(new ErrorHandler("Invailid email or password", 401))
    }

    sendToken(user,200,res);
});  


//     logged out the user
exports.logout = catchAsyncErrors( async(req,res,next)=>{
    res.cookie("token",null, {
        expires:new Date(Date.now()),
        httpOnly:true,
    })


    res.status(200).json({
         success:true,
         message: "Logged Out",
    });
});


//  forgot password 
exports.forgotPassword = catchAsyncErrors(async(req,res,next)=>{

    const user = await User.findOne({email:req.body.email});

    if(!user){
        return next(new ErrorHandler("user not found",404))
    }

    //  get reset password token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    const resetPasswordUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`;

    const message = `your password reset token is :- \n\n ${resetPasswordUrl} \n\n if you have not requested to reset your password then, please ignore it `;

    try {
        await sendEmail({
            email: user.email,
            subject: `Ecommerce Password Recovery`,
            message,
        });
        res.status(200).json({
            success: true,
            message: `email sent to ${user.email} successfully`,
        })
    }catch(error){
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({validateBeforeSave: false});

        return next(new ErrorHandler(error.message, 500)); 
    }
});


//    Reset password  
exports.resetPassword = catchAsyncErrors(async(req, res, next)=>{
    //  creating token hash
    const resetPasswordToken = crypto
    .createHash("sha256").update(req.params.token).digest("hex");

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: {$gt: Date.now()},
    })

    if(!user){
        return next(new ErrorHandler("Reset Password token is invalid or has been expires", 404));
    }
    if(req.body.password !== req.body.confirmPassword){
        return next(new ErrorHandler("password does not equals to password", 404));
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    sendToken(user, 200, res);

});



//      get use details
exports.getUserDetails = catchAsyncErrors(async(req,res,next)=>{

    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        user,
    });
});


//        update User password
exports.updatePassword = catchAsyncErrors(async(req,res,next)=>{

    const user = await User.findById(req.user.id).select("+password");
     
    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

    if(!isPasswordMatched){
        return next(new ErrorHandler("passsword does not matched", 404));
    }

    if(req.body.newPassword !== req.body.confirmPassword){
        return next(new ErrorHandler("newPassword does not equals to cnfirmPassword", 404));
    }

    user.password = req.body.newPassword;

    await user.save();

    sendToken(user, 200, res); 
});


///    update user profile role(user)
exports.updateProfile = catchAsyncErrors(async(req,res,next)=>{
    const newUserData = {
        name:req.body.name,
        email:req.body.email,
    }
    //   add image functionality  later...

    const user = await User.findByIdAndUpdate(req.user.id, newUserData,{
        new: true,
        runValidators: true,
        userFindAndModify: false,
    });

    res.status(200).json({
        success: true
    })

});


//    get all user --->(Admin)
exports.getAllUser = catchAsyncErrors(async(req,res,next)=>{

    const users = await User.find();
       

    res.status(200).json({
        success: true,
        users,
    })

});


//    get single user  --->(Admin)
exports.getSingleUser = catchAsyncErrors(async(req,res,next)=>{

    const user = await User.findById(req.params.id);
    
    if(!user){
        return next(new ErrorHandler(`user dose not exist with Id: ${req.params.id}`));
    }

    res.status(200).json({
        success: true,
        user,
    })

});



///    update user profile role  --->(Admin)
exports.updateUserRole = catchAsyncErrors(async(req,res,next)=>{
    const newUserData = {
        name:req.body.name,
        email:req.body.email,
        role:req.body.role,
    }
 
    const user = await User.findByIdAndUpdate(req.params.id, newUserData,{
        new: true,
        runValidators: true,
        userFindAndModify: false,
    });

    res.status(200).json({
        success: true
    })

});


///    delete user  --->(Admin)
exports.deleteUser = catchAsyncErrors(async(req,res,next)=>{
    
    

    const user = await User.findById(req.params.id);
    //   we will remove cloudinary later

    if(!user){
        return next(new ErrorHandler(`user dose not exist with Id: ${req.params.id}`))
    }

    await user.remove();

    res.status(200).json({
        success: true,
        message: "User deleted successfully"
    })

});