const express = require('express');
const prisma = require('../utils/database');
const hash = require('../utils/hash');
const { createAccessToken } = require('../utils/token1');

const router = express.Router();

router.post('/', async (req, res) => {
    const { username, password } = req.body; // Form data or JSON

    const user = await prisma.user.findUnique({ where: { id: username } });
    if (!user) {
        return res.status(404).json({ detail: "Couldn't find the user" });
    }

    const isValid = await hash.verify(password, user.password);
    if (!isValid) {
        return res.status(404).json({ detail: "Incorrect credentials" });
    }

    const accessToken = createAccessToken({ sub: user.id });
    
    // Omit password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
        access_token: accessToken,
        token_type: "bearer",
        user: userWithoutPassword
    });
});

module.exports = router;