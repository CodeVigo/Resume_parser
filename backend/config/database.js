import mongoose from 'mongoose';
import Grid from 'gridfs-stream';

let gfs;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // Initialize GridFS
    gfs = Grid(conn.connection.db, mongoose.mongo);
    gfs.collection('uploads');
    
    return gfs;
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    process.exit(1);
  }
};

export { gfs };
export default connectDB;