const app = require('./app');
const dotenv = require('dotenv');
const connectDB = require('./config/database');


// Handling Uncaught Exception
process.on("uncaughtException", (err)=>{
    console.log(`Error: ${err.message}`);
    console.log('shutting down the server due to Uncaught Exception');
    process.exit(1); 
})


// configuring the port
dotenv.config({path:'backend/config/config.env'});
// database connection
connectDB()

const server = app.listen(process.env.PORT, ()=>{
    console.log(`server is running on port  ${process.env.PORT}`);
});


///    unhandled promise rejection
process.on("unhandledRejection",err=>{
    console.log(`Error: ${err.message}`);
    console.log('shutting down the server due to Unhandled promise Rejection');
       
    server.close(()=>{
        process.exit(1);
    });
})