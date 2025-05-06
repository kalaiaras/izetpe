const  mongoose  = require("mongoose")

const connectDB = async()=>{
try{
    await mongoose.connect(process.env.MONGO_URI)
    console.log("mongodb connected")
}catch(err){
    console.error("MongDB error:", err)
    process.exit(1)
}
}
export default connectDB