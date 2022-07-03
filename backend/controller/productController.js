const Product = require("../models/productModels");
const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");  
const ApiFeatures = require("../utils/apiFeatures");
 

//  create product  --  admin only
exports.createProduct = catchAsyncErrors(async(req,res,next)=>{

    req.body.user = req.user.id;

    const product = await Product.create(req.body);
    res.status(201).json({
        success: true,
        product
    })
})

// get all products
exports.getAllProducts = catchAsyncErrors(async(req,res,next)=>{
    // return next(new ErrorHandler("this is my test error",500))
    const resultPerPage = 8;
    const productsCount = await Product.countDocuments()

    const apiFeature = new ApiFeatures(Product.find(),req.query)
    .search()
    .filter().pagination(resultPerPage)
    const products = await apiFeature.query;
    res.status(200).json({
        success: true,
        products,
        productsCount
    })
});  

//    get product details
exports.getProductDetails = catchAsyncErrors(async(req, res, next)=>{
    const product = await Product.findById(req.params.id);

    if(!product){
        return next(new ErrorHandler("product not found", 404));
    }
    // if(!product){
    //     return res.status(500).json({
    //         success:false,
    //         message:"Product not found"
    //     })

    res.status(200).json({
        success:true,
        product,
       
    })
});

//  update product -- admin only
exports.updateProduct = catchAsyncErrors(async(req,res,next)=>{
    let product = await Product.findById(req.params.id);
    console.log(product);

    if(!product){
        return next(new ErrorHandler("product not found", 404));
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })
    res.status(200).json({
        success: true,
        product
    })
});
 
//      delete product  
exports.deleteProduct = catchAsyncErrors(async(req, res, next)=>{
    const product = await Product.findById(req.params.id);

    if(!product){
        return next(new ErrorHandler("product not found", 404));
    }

    await product.remove();

    res.status(200).json({
        success:true,
        message:"Product Delete Successfully"
    })
});



//   create New review or update the review
exports.createProductReview = catchAsyncErrors(async(req,res,next)=>{
    const { rating , comment, productId } = req.body;

    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment,
    };

    const product = await Product.findById(productId);
    
    const isReviewed = product.reviews.find(
        (rev) => String(rev.user) === req.user._id.toString()
    )
      

    if(isReviewed){
        product.reviews.forEach((rev) => {
            if(String(rev.user) === req.user._id.toString()){
                
                (rev.rating = rating),
                (rev.comment = comment);
            }
        });
    }
    else{
        product.reviews.push(review)
    }

    let avg = 0;

    product.reviews.forEach(rev => {
        avg += rev.rating;
    }) 
    product.ratings = avg / product.reviews.length;
    product.numOfReviews = product.reviews.length;

    await product.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true,
    })
})



//     get all Review of a product
exports.getProductReviews = catchAsyncErrors(async(req,res,next)=>{
    const product = await Product.findById(req.query.id);

    if(!product){
        return next(new ErrorHandler("Product Not found", 404));
    }

   
    res.status(200).json({
        success : true,
        reviews : product.reviews,
    });
});


//   delete Review
exports.deleteReview = catchAsyncErrors(async(req,res,next)=>{
    const product = await Product.findById(req.query.productId);
    
    if(!product){
        return next(new ErrorHandler("Product Not found", 404));
    }
    const reviews = product.reviews.filter(rev=> rev._id.toString() !== req.query.id.toString());
    
    let avg = 0;
    reviews.forEach((rev)=>{
        avg+=rev.rating;
    });
    const ratings = avg/ reviews.length;
    const numOfReviews = reviews.length;

    await Product.findByIdAndUpdate(req.query.productId, {
        reviews,
        ratings,
        numOfReviews,
    },
    {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    })

    res.status(200).json({
        success : true,
        reviews : product.reviews,
    });
});