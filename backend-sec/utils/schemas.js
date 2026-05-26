const { z } = require('zod');

const schemas = {
    login: z.object({
        username: z.string(),
        password: z.string()
    }),
    userCreate: z.object({
        id: z.string().max(25),
        password: z.string().min(6),
        first_name: z.string().max(20),
        last_name: z.string().max(20),
        role: z.enum(['student', 'warden', 'guard', 'admin']),
        contact_details: z.string().max(10).optional(),
        parent_email: z.string().email().optional()
    }),
    passCreate: z.object({
        pass_type: z.enum(['leave', 'market', 'other']),
        leave_start: z.string().transform(str => new Date(str)),
        leave_end: z.string().transform(str => new Date(str))
    }),
    passEvaluation: z.object({
        pass_status: z.enum(['pending', 'approved', 'rejected'])
    })
};

// Middleware to validate requests
const validate = (schema) => (req, res, next) => {
    try {
        req.body = schema.parse(req.body);
        next();
    } catch (err) {
        res.status(400).json({ error: err.errors });
    }
};

module.exports = { schemas, validate };