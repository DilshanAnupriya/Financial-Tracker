const jwt = require("jsonwebtoken");
const User = require("../model/userModel");

const verifyToken = (requiredRoles = []) => {
    return async (req, res, next) => {
        try {
            const token = req.headers['authorization']?.split(' ')[1];
            if (!token) {
                return res.status(403).json({ message: "Access denied, no token provided" });
            }
            const decoded = jwt.verify(token,process.env.JWT_SECRET);
            console.log("Decoded Token:", decoded);
            req.user = {
                _id: decoded.userId, // Fix: Use userId from token
                username: decoded.username,
                role: decoded.role
            };
            const user = await User.findOne({ username: decoded.username });
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            if (requiredRoles.length && !user.role.some(r => requiredRoles.includes(r))) {
                return res.status(403).json({ message: "You have no access" });
            }

            next(); // Allow access to the next middleware/route
        } catch (error) {
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({ message: "Invalid token" });
            } else if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ message: "Token expired" });
            }
            return res.status(500).json({ message: "Internal Server Error" });
        }
    };
};


module.exports = verifyToken;