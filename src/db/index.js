import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config();

const options = {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	serverSelectionTimeoutMS: 10 * 1000 // 1s timeout
}

class Database {
    constructor() {
		dotenv.config()
	}
    connection = async () => {
		const db = await mongoose.connect(process.env.MONGO_CONNECT, options)
		return db
	}
}

export default new Database()