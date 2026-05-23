import dotenv from 'dotenv';
import connectDB from './db/index.js';

dotenv.config({
    path: './env',
});

connectDB();

// import express from 'express';

// const app = express();

// (async () => {
//     try {
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);

//         app.on('error', (error) => {
//             console.error('Error starting the server:', error);
//         });

//         const PORT = process.env.PORT || 8000;

//         app.listen(PORT, () => {
//             console.log(`Server is listening on port ${PORT}`);
//         });
//     } catch (error) {
//         console.error('Error connecting to MongoDB:', error);
//     }
// })();
