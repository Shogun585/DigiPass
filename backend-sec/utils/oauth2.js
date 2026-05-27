const prisma = require('./database');
const { verifyToken } = require('./token1');

const getCurrentUser = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ detail: 'Recheck your credentials' });
        }
        
        const token = authHeader.split(' ')[1];
        const payload = verifyToken(token);
        
        const user = await prisma.user.findUnique({ where: { id: payload.sub } });
        if (!user) return res.status(401).json({ detail: 'User not found' });
        
        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ detail: 'Unauthorized' });
    }
};

const requireRole = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role.toLowerCase())) {
            return res.status(403).json({ detail: 'You are not authorized' });
        }
        next();
    };
};

// Security Rule: Ensures a user cannot fetch/alter data of another user unless they are warden/admin
const checkDataOwnership = (req, res, next) => {
    const targetId = req.params.student_id || req.body.college_id;
    if (req.user.role === 'warden' || req.user.role === 'admin') {
        return next();
    }
    if (targetId && req.user.id !== targetId) {
        return res.status(403).json({ detail: 'Data isolation violation: Cannot access other users records' });
    }
    next();
};

module.exports = { getCurrentUser, requireRole, checkDataOwnership };