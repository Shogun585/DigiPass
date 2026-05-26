const express = require('express');
const prisma = require('../utils/database');
const hash = require('../utils/hash');
const { schemas, validate } = require('../utils/schemas');

const router = express.Router();

router.post('/', validate(schemas.userCreate), async (req, res) => {
    try {
        const existingUser = await prisma.user.findUnique({ where: { id: req.body.id } });
        if (existingUser) {
            return res.status(409).json({ detail: `User with ${req.body.id} already present` });
        }

        const hashedPassword = await hash.encrypt(req.body.password);

        const newUser = await prisma.user.create({
            data: {
                ...req.body,
                password: hashedPassword
            }
        });

        const { password, ...userResponse } = newUser;
        res.status(201).json(userResponse);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;