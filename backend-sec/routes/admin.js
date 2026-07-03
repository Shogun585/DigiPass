require("dotenv").config()
const express = require("express");
const bcrypt = require("bcrypt");
const multer = require("multer");
const stream = require("stream");
const csv = require("csv-parser");
const prisma = require("../utils/database");
const {getCurrentUser, requireRole} = require("../utils/oauth2");

const router = express.Router();
const upload = multer();

const DEFAULT_PASSWORD = process.env.DEFAULT_PASSWORD;

router.post('/users/bulk', getCurrentUser, requireRole(['admin']), upload.single('file'), async(req, res)=>{
    return res.status(404).json({
        message : "Under construction..."
    });
    
    if(!req.file){
        return res.status(400).json({
            error : "No CSV file uploaded"
        });
    }

    const results = [];
    const bufferStream = new stream.PassThrough();
    bufferStream.end(req.file.buffer);

    bufferStream.pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            const successList = [];
            const failedList = [];

            const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);

            for(const row of results){
                const {id, first_name, last_name, role} = row;

                if(!id || !first_name || !last_name){
                    failedList.push({
                        id : id || 'UNKNOWN',
                        reason : "Missing fields in CSV row"
                    });
                    continue;
                }

                try {
                    const newUser = await prisma.user.create({
                        data : {
                            id : id.trim(),
                            first_name : first_name.trim(),
                            last_name : last_name.trim(),
                            password : hashedPassword,
                            role : (role || 'student').toLowerCase().trim(),
                            is_active : true
                        }
                    });

                    successList.push({
                        id : newUser.id,
                        name : `${newUser.first_name} ${newUser.last_name}`,
                        initial_password : DEFAULT_PASSWORD
                    })
                } catch (error) {
                    if(error.code === 'P2002'){
                        failedList.push({
                            id,
                            reason : "User Id already exists in database"
                        });
                    }else{
                        failedList.push({
                            id,
                            reason : err.message
                        });
                    }
                }

                res.json({
                    message : "Bulk upload processed.",
                    total_processed : results.length,
                    success_count : successList.length,
                    failed_count : failedList.length,
                    successful_user  : successList,
                    failures : failedList
                });
            }
        });
});

router.post('/users', getCurrentUser, requireRole(['admin']), async(req, res) => {
    const {id, first_name, last_name, role, contact_details, parent_email} = req.body;

    try{
        const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);
        const newUser = await prisma.user.create({
            data : {
                id,
                first_name,
                last_name,
                contact_details,
                parent_email,
                password : hashedPassword,
                role : role || 'student'
            },
            select : {
                id : true,
                first_name : true,
                last_name : true,
                role : true
            }
        });

        res.json({
            success : true,
            user : newUser,
            default_password : DEFAULT_PASSWORD
        });
    }catch(err){
        if(err.code === 'P2002'){
            return res.status(400).json({
                error : "User ID already exists"
            });
        }
        res.status(500).json({
            error : err.message
        })
    }
});

router.delete('/users/:id', getCurrentUser, requireRole(['admin']), async (req, res) => {
    const userId = req.params.id;

    try{
        await prisma.user.update({
            where : {
                id : userId
            },
            data : {
                is_active : false
            }
        });

        res.json({
            success : true,
            message : `User ${userId} has been deactivated`
        });
    }catch(err){
        res.status(500).json({
            error : "Failed to deactivate user"
        });
    }
});

router.put('/users/:id/password', getCurrentUser, requireRole(['admin']), async (req, res) => {
    const userId = req.params.id;
    const {new_password} = req.body;

    if(!new_password || new_password.length < 6){
        return res.status(400).json({
            error : "Password must be at least 6 characters"
        });
    }

    try {
        const hashedPassword = await bcrypt.hash(new_password, 10);

        await prisma.user.update({
            where : {
                id : userId
            },
            data : {
                password : hashedPassword
            }
        });

        res.json({
            success : true,
            message : `Password updated for ${userId}`
        });
    } catch (error) {
        res.status(500).json({
            error : "Failed to update password."
        });
    }
});

module.exports = router;