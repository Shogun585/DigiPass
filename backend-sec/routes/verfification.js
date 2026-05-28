const express = require('express');
const multer = require('multer');
const prisma = require('../utils/database');
const { getCurrentUser, requireRole } = require('../utils/oauth2');
const { extractBarcodeFromBuffer } = require('../utils/barcode_scanner');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const verifyPassLogic = async (collegeId) => {
    const user = await prisma.user.findUnique({ where: { id: collegeId } });
    
    if (!user) {
        return { valid: false, message: `User with ID ${collegeId} not found`, pass_details: null, user_details: null };
    }

    const { password, ...userWithoutPassword } = user;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const validPass = await prisma.leavePass.findFirst({
        where: {
            college_id: collegeId,
            pass_status: 'approved',
            leave_start: { lte: today },
            leave_end: { gte: today }
        },
        orderBy : {
            request_time : 'desc'
        },
        include : {
            logs : {
                orderBy : {
                    scan_time : 'desc'
                },
                take : 1
            }
        }
    });

    if (!validPass) {
        return {
            valid: false,
            message: `No valid approved pass found for ${user.first_name} ${user.last_name}`,
            pass_details: null,
            user_details: userWithoutPassword
        };
    }

    const isCheckedIn = validPass.logs.length > 0 && validPass.logs[0].student_status === 'in';

    if(isCheckedIn){
        return { 
            valid: false, 
            message: "This pass has already been used and checked back in. Waiting for new passes to be approved.", 
            pass_details: null, 
            user_details: userWithoutPassword 
        };
    }

    return {
        valid: true,
        message: `Valid ${validPass.pass_type} pass found for ${user.first_name} ${user.last_name}`,
        pass_details: validPass,
        user_details: userWithoutPassword
    };
};

router.post('/checkout/:pass_id', getCurrentUser, requireRole(['guard']), async(req, res)=>{
    const passId = parseInt(req.params.pass_id);

    try{
        const pass = await prisma.leavePass.findUnique({
            where : {
                pass_id : passId
            }
        })

        if(!pass){
            return res.status(404).json({
                detail : "Pass not found"
            })
        }

        const latestLog = await prisma.log.findFirst({
            where : {
                pass_id : passId,
            },
            orderBy : {
                scan_time : 'desc'
            }
        })

        if(latestLog && latestLog.student_status === 'out'){
            return res.status(400).json({
                detail : "Action detected: Student is already checked out."
            })
        }

        const newLog = await prisma.log.create({
            data : {
                pass_id : passId,
                staff_id : req.user.id,
                action : 'checked_out',
                student_status : 'out'
            }
        });

        res.json({
            detail : "Student successfully checked out",
            log : newLog
        })
    }catch(err){
        res.status(500).json({
            error : err.message
        })
    }
});

router.post('/checkin/:pass_id', getCurrentUser, requireRole(['guard']), async(req, res)=>{
    const passId = parseInt(req.params.pass_id);

    try{
        const pass = await prisma.leavePass.findUnique({
            where : {
                pass_id : passId
            }
        })

        if (!pass){
            return res.status(404).json({ detail: "Pass not found" });
        }

        const latestLog = await prisma.log.findFirst({
            where : {
                pass_id : passId
            },
            orderBy : {
                scan_time : 'desc'
            }
        })

        if(!latestLog || latestLog.student_status === 'in'){
            return res.status(400).json({
                detail : "Action denied. Student is already checked in or didn't check out."
            })
        }

        const newLog = await prisma.log.create({
            data : {
                pass_id : passId,
                staff_id : req.user.id,
                action : 'checked_in',
                student_status : 'in'
            }
        })

        res.json({
            detail : "Student successfully checked in",
            log : newLog
        })
    }catch(err){
        res.status(500).json({
            error : err.message
        });
    }
})

router.post('/scan', getCurrentUser, requireRole(['guard']), upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ detail: "No image uploaded" });
    }

    const result = await extractBarcodeFromBuffer(req.file.buffer);

    if (!result.ok) {
        return res.status(400).json({ detail: `Failed to scan barcode: ${result.reason}` });
    }

    const collegeId = result.data.trim();
    if (!collegeId) {
        return res.status(400).json({ detail: "Barcode data is empty" });
    }

    const verificationResponse = await verifyPassLogic(collegeId);
    res.json(verificationResponse);
});

router.get('/manual/:college_id', getCurrentUser, requireRole(['guard']), async (req, res) => {
    const verificationResponse = await verifyPassLogic(req.params.college_id);
    res.json(verificationResponse);
});

module.exports = router;