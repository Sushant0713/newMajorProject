import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const generateToken = (userId, res) => {
    const token = jwt.sign({userId}, process.env.JWT_SECRET, {
        expiresIn: "9h"
    }); 

    res.cookie("jwt", token, {
        maxAge: 9*60*60*1000,
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "development" ? "strict": "none",
        secure: process.env.NODE_ENV === "development" ? false: true, // Set to true if using HTTPS
        path: "/"
    });

    return token;
};