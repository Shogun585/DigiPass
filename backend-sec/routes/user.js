const express = require('express');
const prisma = require('../utils/database');
const hash = require('../utils/hash');
const { schemas, validate } = require('../utils/schemas');
const { getCurrentUser, requireRole } = require('../utils/oauth2');

const router = express.Router();

router.post('/', getCurrentUser, requireRole('admin'),  validate(schemas.userCreate), async (req, res) => {
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

router.delete('/:id', getCurrentUser, requireRole('admin'), async(req, res)=>{
    const targetedUserId = req.params.id;

    try{
        const targetUser = await prisma.user.findUnique({
            where : targetedUserId
        });

        if(!targetUser){
            return res.status(404).json({
                detail : `User with ${targetedUserId} not found`
            })
        }


        if(targetUser.role.toLowerCase() === 'admin'){
            return res.status(403).json({ 
                detail: "Action forbidden: Deletion of admin accounts is strictly prohibited." 
            });
        }
 
        await prisma.user.delete({ 
            where: { id: targetUserId } 
        });

        res.json({ detail: `User ${targetUserId} successfully deleted` });
    }catch(err){
        res.status(500).json({ error: err.message });
    }
})

module.exports = router;