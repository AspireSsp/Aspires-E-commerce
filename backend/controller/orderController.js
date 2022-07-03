const Order = require("../models/orderModel");
const Product = require("../models/productModels");
const User = require("../models/userModel");
const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");  
const { default: isFQDN } = require("validator/lib/isFQDN");


//   create new order..
exports.newOrder = catchAsyncErrors(async(req,res,next)=>{
     
    const{
        shippingInfo,
        orderItems,
        paymentInfo,
        itemsPrice,
        texPrice,
        shippingPrice,
        totalPrice,
    } = req.body;

    const order = await Order.create({
        shippingInfo,
        orderItems,
        paymentInfo,
        itemsPrice,
        texPrice,
        shippingPrice,
        totalPrice,
        paidAt: Date.now(),
        user: req.user._id,
    });
    res.status(201).json({
        success: true,
        order,
    })
});


//   get single order
exports.getSingleOrder = catchAsyncErrors(async(req,res,next)=>{

    const order = await Order.findById(req.params.id).populate('user');

    if(!order){
        return next(new ErrorHandler("Order not found with this id", 404));
    }

    res.status(200).json({
        success: true,
        order,
    })
});


//   get logged in user orders
exports.myOrders = catchAsyncErrors(async(req,res,next)=>{

    const orders = await Order.find({ user: req.user._id});

    res.status(200).json({
        success: true,
        orders,
    });
});


//   get all orders  ---> Admin
exports.getAllOrders = catchAsyncErrors(async(req,res,next)=>{

    const orders = await Order.find();

    let totalAmount = 0;

    orders.forEach((order)=>{
        totalAmount += order.totalPrice;
    })
    res.status(200).json({
        success: true,
        totalAmount,
        orders,
    });
});


//   update order status  ---> Admin
exports.updateOrder = catchAsyncErrors(async(req,res,next)=>{

    const order = await Order.findById(req.params.id);

    if(!order){
        return next(new ErrorHandler("Order not found with this id", 404));
    }
    
    if(order.orderStatus === "Delivered"){
        return next(new ErrorHandler("You have already delivered this order", 400));
    }

    order.orderItems.forEach(async(o)=>{
        await updateStoke(o.product, o.Quantity)
    })

    order.orderStatus = req.body.status;

    if(req.body.status === "Delivered"){
        order.deliveredAt = Date.now();
    }
    
    await order.save({validateBeforeSave : false});
    res.status(200).json({
        success: true,
        
    });
});

async function updateStoke(id,quantity) {
    const product = await Product.findById(id);

    console.log(product.stock);
    product.stock -= quantity;
    console.log(product.stock);

    await product.save({ validateBeforeSave : false })
}


//   delete order   ---> Admin
exports.deleteOrder = catchAsyncErrors(async(req,res,next)=>{

    const order = await Order.findById(req.params.id);

    if(!order){
        return next(new ErrorHandler("Order not found with this id", 404));
    }

    await order.remove()
    res.status(200).json({
        success: true,
        
    });
});
