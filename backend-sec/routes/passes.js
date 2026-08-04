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
        const pendingPass = await prisma.leavePass.findFirst({
            where : {
                college_id : req.user.id,
                pass_status : 'pending'
            },
            orderBy : {
                request_time : 'desc'
            }
        });

        if(pendingPass){
            return res.status(403).json({
                detail : "Action denied: You already have a pending pass request waiting for warden approval."
            })
        }

        const latestLog = await prisma.log.findFirst({
            where : {
                leave_pass : {
                    college_id : req.user.id
                }
            },
            orderBy : {
                scan_time : 'desc'
            }
        });

        if(latestLog && latestLog.student_status != 'in'){
            return res.status(403).json({
                detail : "Action denied: The security logs show you are currently out of the hostel. You must check back in before applying for a new pass."
            })
        }

        const today = new Date()
        today.setHours(0, 0, 0, 0);

        const unusedApprovedPass = await prisma.leavePass.findFirst({
            where : {
                college_id : req.user.id,
                pass_status : 'approved',
                leave_end : {gte : today},
                logs : {none : {}}
            }
        });

        if(unusedApprovedPass){
            return res.status(403).json({
                detail : `Action denied: You have an unused approved ${unusedApprovedPass.pass_type} pass. You must use it (or let it expire) before applying again.`
            });
        }

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
    const passes = await prisma.leavePass.findMany({
        where: { pass_status: 'pending' },
        include : {
            college : {
                select : {
                    first_name : true,
                    last_name : true,
                    contact_details : true,
                    parent_email : true,
                    parents_phone : true
                }
            }
        }
    });
    res.json(passes);
});

router.get('/all', getCurrentUser, requireRole(['warden']), async (req, res) => {
    const passes = await prisma.leavePass.findMany();
    res.json(passes);
});

router.get('/my_pass', getCurrentUser, requireRole(['student']), async (req, res) => {
    try {
        const passes = await  prisma.leavePass.findMany({
            where : {
                college_id : req.user.id
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

        res.json(passes)
    } catch (error) {
        res.status(500).json({
            error : error.message
        })
    }
});

router.put('/status/:pass_id', getCurrentUser, requireRole(['warden']), validate(schemas.passEvaluation), async (req, res) => {
    const passId = parseInt(req.params.pass_id);

    const {pass_status, remark} = req.body;
    
    try {
        const pass = await prisma.leavePass.findUnique({ where: { pass_id: passId } });
        if (!pass) return res.status(404).json({ detail: `Pass with id ${passId} not found` });

        const updatedPass = await prisma.leavePass.update({
            where: { pass_id: passId },
            data: { 
                pass_status: req.body.pass_status,
                remark : remark || null
            }
        });

        res.json(updatedPass);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/convert', getCurrentUser, requireRole(['student']), async(req, res) => {
    const {leave_end} = req.body;

    if(!leave_end){
        return res.status(400).json({
            detail : "A new leave_end date is required to convert to a leave pass."
        })
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try{
        const recentPass = await prisma.leavePass.findFirst({
            where : {
                college_id : req.user.id
            },
            orderBy : {
                request_time : 'desc'
            }
        });

        if(!recentPass || recentPass.pass_type.toLowerCase() !== 'market'){
            return res.status(400).json({
                detail : "Action denied. Your most rescent pass is not a market pass."
            })
        }

        const updatedPass = await prisma.leavePass.update({
            where : {
                pass_id : recentPass.pass_id
            },
            data : {
                pass_type : 'leave',
                leave_end : new Date(leave_end),
                pass_status : 'pending'
            }
        });

        await sendParentNotification(
            req.parent_email,
            req.first_name,
            'leave (extended from a market pass)'
        );

        res.status(200).json({
            detail : "Market pass successfully converted to a Leave pass and is pending warden approval."
        })
    }catch(error){
        res.status(500).json({
            error : error.message
        })
    }
})

router.post('/extend/:pass_id', getCurrentUser, requireRole(['student']), async(req, res)=>{
    const passId = parseInt(req.params.pass_id);

    const {new_leave_end} = req.body;

    if(!new_leave_end){
        return res.status(400).json({
            detail : "A new return date is required."
        })
    }        

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const requestedEndDate = new Date(new_leave_end);

    try {
        const passToExtend = await prisma.leavePass.findUnique({
            where : {
                pass_id : passId
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

        if(!passToExtend || passToExtend.college_id !== req.user.id || passToExtend.pass_type !== 'leave'){
            return res.status(403).json({
                detail : "Action denied. Invalid pass."
            })
        }

        if(passToExtend.pass_status !== 'approved' && passToExtend.pass_status !== 'pending'){
            return res.status(400).json({
                detail : "Only approved or pending passes can be extended."
            })
        }

        if(passToExtend.leave_end <= today){
            return res.status(400).json({
                detail : "This pass has already expired. You must apply for a new pass instead of extending it."
            })
        }

        if(requestedEndDate <= passToExtend.leave_end){
            return res.status(400).json({
                detail : "Extension can only be made for future date. If returning early, simply scan your ID at the gate."
            })
        }

        const isCheckedIn = passToExtend.logs.length > 0 && passToExtend.logs[0].student_status === 'in';
        if(isCheckedIn){
            return res.status(400).json({
                detail : "Cannot extend a pass after you have already checked back into the hostel."
            })
        }

        const updatedPass = await prisma.leavePass.update({
            where : {
                pass_id : passId
            },
            data : {
                leave_end : requestedEndDate,
                pass_status : 'pending',
                is_extension : true
            }
        })

        // await sendParentNotification(
        //     req.user.parent_email,
        //     req.user.first_name,
        //     `leave (Extended until ${requestedEndDate.toISOString().split('T')[0]})`
        // )

        res.status(200).json({
            detail : "Leave pass successfully extended and is pending warden approval.",
            pass : updatedPass
        })

    } catch (error) {
        console.error(error)
        res.status(500).json({
            error : error.message
        })
    }
})

router.get('/late-returns', getCurrentUser, requireRole(['warden', 'admin']), async(req, res)=>{
    try{
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const passes = await prisma.leavePass.findMany({
            where : {
                pass_type : 'market',
                leave_start : {
                    gte : today
                },
                logs : {
                    some : {
                        action : 'checked_in'
                    }
                }
            },
            include : {
                logs : {
                    orderBy : {
                         scan_time : 'desc'
                    },
                    take : 1
                },
                user : {
                    select : {
                        first_name : true,
                        last_name : true,
                    }
                }
                
            }
        });

        const latestPasses = passes.filter(pass => {
            if(!pass.logs || pass.logs.length === 0){
                return false;
            }

            const checkInTime = new Date(pass.logs[0].scan_time);

            const options = {
                timeZone : 'Asia/Kolkata',
                hour : 'numeric',
                hour12 : false
            };

            const isHour = parseInt(new Intl.DateTimeFormat('en-US', options).format(checkInTime));

            return isHour >= 21; // 9 PM
        })

        res.json(latestPasses)
        
    }catch(error){
        res.status(500).json({
            error : error.message
        })
    }
})

router.put('/remark/:pass_id', getCurrentUser, requireRole(['admin', 'warden']), async (req, res) => {
    
    const {remark} = req.body;

    try{
        const updatedPass = await prisma.leavePass.update({
            where : {
                pass_id : parseInt(req.params.pass_id)
            },
            data : {
                remark : remark
            }
        });

        res.json({
            success : true,
            pass : updatedPass
        })
    }catch{
        res.status(500).json({
            detail : error.message
        })
    }
})

router.get('/logs', getCurrentUser, requireRole(['warden', 'admin']), async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const logs = await prisma.$queryRaw`
            WITH LatestLogs AS (
                SELECT DISTINCT ON (l.pass_id) 
                    l.scan_id, l.pass_id, l.staff_id, l.action, l.student_status, l.scan_time,
                    s.first_name AS staff_first_name, s.last_name AS staff_last_name,
                    c.id AS student_id, c.first_name AS student_first_name, c.last_name AS student_last_name
                FROM logs l
                JOIN leave_pass p ON l.pass_id = p.pass_id
                JOIN users s ON l.staff_id = s.id
                JOIN users c ON p.college_id = c.id
                WHERE l.scan_time >= ${twentyFourHoursAgo}
                ORDER BY l.pass_id, l.scan_time DESC
            )
            SELECT * FROM LatestLogs
            ORDER BY scan_time DESC
            LIMIT ${limit} OFFSET ${offset};
        `;

        const countResult = await prisma.$queryRaw`
            SELECT COUNT(DISTINCT pass_id)::int as total
            FROM logs
            WHERE scan_time >= ${twentyFourHoursAgo};
        `;
        const totalCount = countResult[0].total;

        const formattedLogs = logs.map(log => ({
            scan_id: log.scan_id,
            pass_id: log.pass_id,
            staff_id: log.staff_id,
            action: log.action,
            student_status: log.student_status,
            scan_time: log.scan_time,
            staff: {
                first_name: log.staff_first_name,
                last_name: log.staff_last_name
            },
            leave_pass: {
                college: {
                    id: log.student_id,
                    first_name: log.student_first_name,
                    last_name: log.student_last_name
                }
            }
        }));

        res.json({
            logs: formattedLogs,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page
        });
    } catch (error) {
        console.error("Error fetching logs:", error);
        res.status(500).json({ detail: "Failed to fetch logs" });
    }
});

module.exports = router;