const mongoose = require("mongoose");
 
const connectDB = async () =>{
    
        mongoose.connect(process.env.mongoURL,{ 
            useNewUrlParser: true,
            useUnifiedTopology: true,
            // useCreateIndex: true
        }).then((data)=>{
            console.log(`connnected to mongoDB : ${data.connection.host}`);
        })
    
}


module.exports = connectDB;    