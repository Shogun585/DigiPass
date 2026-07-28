const express = require('express');
const multer = require('multer');
const prisma = require('../utils/database');
const { getCurrentUser, requireRole } = require('../utils/oauth2');
const { extractBarcodeFromBuffer } = require('../utils/barcode_scanner');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const verifyPassLogic = async ({ collegeId, qrToken }) => {
    let validPass = null;
    let targetUser = null;
    
    const getLocalYYYYMMDD = (dateInput) => {
        const d = dateInput ? new Date(dateInput) : new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    const today = new Date(getLocalYYYYMMDD());

    if (qrToken) {
        validPass = await prisma.leavePass.findUnique({
            where: { qr_token: qrToken },
            include: {
                college: true, 
                logs: { orderBy: { scan_time: 'desc' }, take: 1 }
            }
        });

        if (!validPass) {
            return { valid: false, message: "Invalid or forged QR Code.", pass_details: null, user_details: null };
        }
        
        targetUser = validPass.college;

        const startDate = new Date(getLocalYYYYMMDD(validPass.leave_start));
        const endDate = new Date(getLocalYYYYMMDD(validPass.leave_end));
        if (startDate > today || endDate < today) {
            const { password, ...safeUser } = targetUser;
            return { valid: false, message: "This pass is not valid for today's date.", pass_details: null, user_details: safeUser };
        }
    }else if (collegeId) {
        targetUser = await prisma.user.findUnique({ where: { id: collegeId } });
        if (!targetUser) return { valid: false, message: `User with ID ${collegeId} not found`, pass_details: null, user_details: null };

        validPass = await prisma.leavePass.findFirst({
            where: {
                college_id: collegeId,
                pass_status: 'approved',
                leave_start: { lte: today },
                leave_end: { gte: today }
            },
            orderBy: { request_time: 'desc' },
            include: { logs: { orderBy: { scan_time: 'desc' }, take: 1 } }
        });

        if (!validPass) {
            const { password, ...safeUser } = targetUser;
            return { valid: false, message: `No valid approved pass found for ${targetUser.first_name}`, pass_details: null, user_details: safeUser };
        }
    } else {
        return { valid: false, message: "No scanning data provided.", pass_details: null, user_details: null };
    }

    const { password, ...userWithoutPassword } = targetUser;
    const isCheckedIn = validPass.logs.length > 0 && validPass.logs[0].student_status === 'in';

    if(isCheckedIn){
        return { 
            valid: false, 
            message: "This pass has already been used and checked back in.", 
            pass_details: validPass, 
            user_details: userWithoutPassword 
        };
    }

    return {
        valid: true,
        message: `Valid ${validPass.pass_type} pass found for ${targetUser.first_name}`,
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

router.post('/scan', getCurrentUser, requireRole(['guard']), async (req, res) => {
    const { qr_token } = req.body;
    if (!qr_token) return res.status(400).json({ detail: "No QR token provided" });

    const verificationResponse = await verifyPassLogic({ qrToken: qr_token });
    res.json(verificationResponse);
});

router.get('/manual/:college_id', getCurrentUser, requireRole(['guard']), async (req, res) => {
    const verificationResponse = await verifyPassLogic({collegeId : req.params.college_id});
    res.json(verificationResponse);
});

module.exports = router;