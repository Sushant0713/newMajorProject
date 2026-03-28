import jwt from "jsonwebtoken";
import { executeQuery } from "../lib/executeQuery.js";

export const protectRoute = async (req, res, next) => {
    // console.log("protect route started");

    try {
        const token = req.cookies.jwt;

        if (!token) {
            return res.status(401).json({
                message: "Unauthorized - No token provided"
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded || !decoded.userId) {
            return res.status(401).json({
                message: "Unauthorized - Invalid token"
            });
        }

        let user;

        if (decoded.userId.includes("ADM")) {
            // console.log("user is admin");
            const query = `SELECT admin_id, email FROM admins WHERE admin_id = ?`;
            user = await executeQuery(query, [decoded.userId]);
            if (user.length === 0) {
                return res.status(404).json({
                    message: "Admin not found"
                });
            }
            req.user = {
                id: user[0].admin_id,
                email: user[0].email,
                role: "admin"
            };
        } 

        else if (decoded.userId.includes("EMP")) {
            // console.log("user is employee");
            const query = `SELECT employee_id, email FROM employees WHERE employee_id = ?`;
            user = await executeQuery(query, [decoded.userId]);
            if (user.length === 0) {
                return res.status(404).json({
                    message: "Employee not found"
                });
            }
            req.user = {
                id: user[0].employee_id,
                email: user[0].email,
                role: "employee"
            };
        } 
        
        else {
            // console.log("unauthorized user");
            return res.status(401).json({
                message: "Unauthorized - Invalid user type"
            });
        }
        
        // console.log("protect route ended");
        next(); // continue to route controller

    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                message: "Session expired. Please login again."
            });
        }

        return res.status(401).json({
            message: "Unauthorized - Token verification failed"
        });
    }
};