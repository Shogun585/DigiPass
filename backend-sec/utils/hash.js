const bcrypt = require('bcrypt');

const Hashing = {
    encrypt: async (password) => {
        const salt = await bcrypt.genSalt(10);
        return bcrypt.hash(password, salt);
    },
    verify: async (plainPassword, hashedPassword) => {
        return bcrypt.compare(plainPassword, hashedPassword);
    }
};

module.exports = Hashing;