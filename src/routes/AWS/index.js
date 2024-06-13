import {Router} from 'express'
import UploadController from '../../controllers/AWS/index.js'
import multer from 'multer'

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const uploadRouter = Router()

uploadRouter.post('/upload', upload.array('files'), UploadController.fileUpload)
uploadRouter.get('/download', UploadController.downloadFile)

export default uploadRouter 