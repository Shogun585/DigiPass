const jwt = require('jsonwebtoken');
require('dotenv').config();

const SECRET_KEY = process.env.SECRET_KEY || 'your_secret_key';
const ACCESS_TOKEN_EXPIRE_TIME = '20m';

const createAccessToken = (data) => {
    return jwt.sign(data, SECRET_KEY, { expiresIn: ACCESS_TOKEN_EXPIRE_TIME });
};

const verifyToken = (token) => {
    try {
        return jwt.verify(token, SECRET_KEY);
    } catch (error) {
        throw new Error('Invalid or expired token');
    }
};

module.exports = { createAccessToken, verifyToken };