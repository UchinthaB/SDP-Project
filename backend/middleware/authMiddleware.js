const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
    try {
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];

        if (!token) {
            console.log("No token provided");
            return res.status(401).json({ message: 'Authentication required' });
        }

        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                console.log("Token verification failed:", err.message);
                return res.status(403).json({ message: 'Invalid or expired token' });
            }
            
            console.log("Authenticated user:", user);
            req.user = user;
            next();
        });
    } catch (error) {
        console.error("Authentication error:", error);
        return res.status(500).json({ message: 'Authentication process failed' });
    }
};

module.exports = authenticateToken;