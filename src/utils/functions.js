import { SERVER_ERROR, STATUS_CODES, TYPES } from "./constant.js"

const response = ({ type, error, data, message, ...fields }) => {
    const object = { type, error, data, message }
    if (!error || !!data) delete object[error]
	if (!data || !!error) delete object[data]
	if (!message) delete object[message]
	return { ...object, ...fields }
}

const serverError = (error, res) => res.status(STATUS_CODES.SERVER_ERROR).json(
    response({
        type: TYPES.ERROR,
        message: error?.message || SERVER_ERROR
    })
)

export { serverError, response }