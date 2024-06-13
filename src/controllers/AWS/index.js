// import dotenv from 'dotenv'
// import { STATUS_CODES, TYPES } from '../../utils/constant.js'
// import { response, serverError } from '../../utils/functions.js'
// // import {aws-sdk} from 'aws-sdk'

// import AWS from 'aws-sdk';
// import { Upload } from '@aws-sdk/lib-storage';
// import { S3 } from '@aws-sdk/client-s3';
// import archiver from 'archiver'
// import unzipper from 'unzipper'
// import fs from 'fs'
// import multer from 'multer'



// AWS.config.update({
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//     region: process.env.AWS_REGION,
//   });

//   const s3 = new AWS.S3();


// // Configure multer for file upload
// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage });


// class UploadController {
//     constructor() {
//         dotenv.config()
//     }

//      fileUpload = async (req, res) => {
//         try {
//             const zipFileName = 'archive.zip';
//             // console.log("1");

//             const archive = archiver('zip', { zlib: { level: 9 } });
//             // console.log("2");

//             archive.pipe(fs.createWriteStream(zipFileName));

//               // Log buffer size before archiving
//          console.log('Buffer size before archiving:', Buffer.concat(req.files.map(file => file.buffer)).length);
//             // console.log("3");

//             // Use Promise-based append
//       await Promise.all(req.files.map(file => archive.append(file.buffer, { name: file.originalname })));

//             // console.log("4",req.files);
//             // console.log("4");
//             // console.log('Buffer length before archiving:', Buffer.concat(file.buffer).length);
//             // req.files.forEach((file) => {
//             //     console.log('Adding file to archive:', file.originalname, 'Size:', file.buffer.length);
//             //     archive.append(file.buffer, { name: file.originalname });
//             // });
//             // console.log("5");

//             await archive.finalize();
//             // console.log("6");

//              // Log buffer size before upload
//       const bodyBuffer = Buffer.concat(req.files.map(file => file.buffer));
//       console.log('Buffer size before upload:', bodyBuffer.length);

//             const params = {
//                 Bucket: process.env.S3_BUCKET_NAME,
//                 Key: zipFileName,
//                 // Body: fs.createReadStream(zipFileName),
//                 Body: bodyBuffer,
//                 ContentType: 'application/zip',
//             }
//             // console.log("7",params);
//             await s3.upload(params).promise()

//             return res.status(200).json({
//                 success: true,
//                 message: 'Files uploaded and zipped successfully.',
//               });
//             // await new Upload({
//             //     client: s3,
//             //     params,
//             // }).done()
//             // fs.unlinkSync(zipFileName);
//             // return res.status(STATUS_CODES.SUCCESS).json(
//             //     response({
//             //         type: TYPES.SUCCESS,
//             //         message: 'Files uploaded and zipped successfully.'
//             //     })
//             // )
//         } catch (error) {
//             serverError(error, res)

//         }
//     }



// }

// export default new UploadController()


import dotenv from 'dotenv';
import { STATUS_CODES, TYPES } from '../../utils/constant.js';
import { response, serverError } from '../../utils/functions.js';
import AWS from 'aws-sdk';
import archiver from 'archiver-promise';
import unzipper from 'unzipper'
import fs from 'fs';
import { createWriteStream } from 'fs';
import multer from 'multer';

dotenv.config();

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

class UploadController {
    constructor() { }

    fileUpload = async (req, res) => {
        try {
            const zipFileName = 'archive.zip';
    
            // Create a Promise-based archiver
            const archive = archiver('zip', { zlib: { level: 9 } });
    
            // Use Promise-based append
            await Promise.all(req.files.map(file => archive.append(file.buffer, { name: file.originalname })));
    
            // Finalize the archive
            archive.finalize();
    
            // Create a writable stream to capture the archive data
            const streamBuffer = await new Promise((resolve, reject) => {
                const chunks = [];
                archive.on('data', chunk => chunks.push(chunk));
                archive.on('end', () => resolve(Buffer.concat(chunks)));
                archive.on('error', reject);
            });
    
            // Log the size of the buffer before upload
            console.log('Buffer size before upload:', streamBuffer.length);
    
            // Upload to S3
            const params = {
                Bucket: process.env.S3_BUCKET_NAME,
                Key: zipFileName,
                Body: streamBuffer,
                ContentType: 'application/zip',
            };
    
            await s3.upload(params).promise();
    
            console.log('Upload completed');
    
            return res.status(200).json({
                success: true,
                message: 'Files uploaded and zipped successfully.',
            });
        } catch (error) {
            console.error('Error during file upload:', error);
            serverError(error, res);
        }
    };
    



    downloadFile = async (req, res) => {
        try {
            const s3Params = {
                Bucket: process.env.S3_BUCKET_NAME,
                Key: 'archive.zip',
            };

            const s3Stream = s3.getObject(s3Params).createReadStream();

            // Set the local path where you want to save the downloaded file
            const localFilePath = 'E:/Node Js Setup/gross-backend/src/download.zip';

            // Create a writable stream to save the file locally
            const localFileStream = createWriteStream(localFilePath, { encoding: 'binary' });

            // Pipe the S3 stream to the local file stream
            s3Stream.pipe(localFileStream, { end: true });

            // Handle errors during streaming
            s3Stream.on('error', (err) => {
                console.error('Error during S3 streaming:', err);
                res.status(500).json({
                    type: 'error',
                    message: 'Internal Server Error',
                });
            });

            // Handle events on the writable stream
            localFileStream.on('error', (err) => {
                console.error('Error during local file writing:', err);
                res.status(500).json({
                    type: 'error',
                    message: 'Internal Server Error',
                });
            });

            localFileStream.on('finish', () => {
                console.log('Download completed');
                res.json({
                    success: true,
                    message: 'File downloaded successfully.',
                });
            });
        } catch (error) {
            console.error('Error during downloadFile:', error);
            res.status(500).json({
                type: 'error',
                message: 'Internal Server Error',
            });
        }
    };
}

export default new UploadController();


