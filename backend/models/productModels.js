const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true, "product name is required"],
        trim: true
    },
    description:{
        type: String,
        required: [true, "product description is required"]
    },
    price:{
        type: Number,
        required: [true, "product price is required"],
        maxlength: [8, "product price is too long"]
    },
    ratings:{
        type: Number,
        default: 0
    },
    images:[
        {
            public_id:{
            type: String,
            required: true,
            },
            url:{
                type: String,
                required:true
            }
        }
    ],
    category:{
        type: String,
        required: [true, "product category is required"],
    },
    stock:{
        type: Number,
        required: [true, "product stock is required"],
        maxlength: [4, "product stock is too much"],
        default: 1
    },
    numOfReviews:{
        type: Number,
        default: 0
    },
    reviews:[
        {
            user:{
                type:mongoose.Schema.ObjectId,
                ref:"user",
                // required:true,
            },
            name:{
                type: String,
                required: true,
            },
            rating:{
                type: Number,
                required: true,
            },
            comment:{
                type: String,
                required: true,
            }
        }
    ],

    user:{
        type:mongoose.Schema.ObjectId,
        ref:"user",
        required:true,
    },
    createdAt:{
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model("product", productSchema);