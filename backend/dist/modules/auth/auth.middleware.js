"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
const jwt_1 = require("../../utils/jwt");
function requireAuth(req, res, next) {
    const authorization = req.headers.authorization;
    if (!authorization) {
        res.status(401).json({
            message: "Authorization header is required",
        });
        return;
    }
    const [type, token] = authorization.split(" ");
    if (type !== "Bearer" || !token) {
        res.status(401).json({
            message: "Invalid authorization format",
        });
        return;
    }
    try {
        const payload = (0, jwt_1.verifyToken)(token);
        req.user = payload;
        next();
    }
    catch (error) {
        res.status(401).json({
            message: "Invalid or expired token",
        });
    }
}
