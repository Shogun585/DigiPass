const express = require('express');
const prisma = require('../utils/database');
const { getCurrentUser, requireRole } = require('../utils/oauth2');
const { schemas, validate } = require('../utils/schemas');

const router = express.Router();

// Mock parent notification service
const sendParentNotification = async (email, studentName, passType) => {
    if(!email) return;
    console.log(`[EMAIL DISPATCH] Sent to ${email}: ${studentName} applied for a ${passType} pass.`);
};

router.post('/', getCurrentUser, requireRole(['student']), validate(schemas.passCreate), async (req, res) => {
    const { pass_type, leave_start, leave_end } = req.body;

    if (pass_type.toLowerCase() === 'market' && leave_start.getTime() !== leave_end.getTime()) {
        return res.status(400).json({ detail: "For market pass the leave start and end should be same" });
    }

    try {
        const newPass = await prisma.leavePass.create({
            data: {
                pass_type,
                leave_start,
                leave_end,
                pass_status: 'pending',
                college_id: req.user.id
            }
        });

        // Trigger Notification Feature
        await sendParentNotification(req.user.parent_email, req.user.first_name, pass_type);

        res.json(newPass);
    } catch (error) {
        res.status(500).json({ detail: error.message });
    }
});

router.get('/pending', getCurrentUser, requireRole(['warden']), async (req, res) => {
    const passes = await prisma.leavePass.findMany({ where: { pass_status: 'pending' } });
    res.json(passes);
});

router.get('/all', getCurrentUser, requireRole(['warden']), async (req, res) => {
    const passes = await prisma.leavePass.findMany();
    res.json(passes);
});

router.get('/my_pass', getCurrentUser, requireRole(['student']), async (req, res) => {
    const passes = await prisma.leavePass.findMany({ where: { college_id: req.user.id } });
    res.json(passes);
});

router.put('/status/:pass_id', getCurrentUser, requireRole(['warden']), validate(schemas.passEvaluation), async (req, res) => {
    const passId = parseInt(req.params.pass_id);
    
    try {
        const pass = await prisma.leavePass.findUnique({ where: { pass_id: passId } });
        if (!pass) return res.status(404).json({ detail: `Pass with id ${passId} not found` });

        const updatedPass = await prisma.leavePass.update({
            where: { pass_id: passId },
            data: { pass_status: req.body.pass_status }
        });

        res.json(updatedPass);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;