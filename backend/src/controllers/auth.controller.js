import bcrypt from "bcryptjs";
import { executeQuery } from "../lib/executeQuery.js";
import { generateToken } from "../lib/utils.js";
import { generateOTP, hashOTP, verifyHashedOTP, sendEmail } from "../middleware/forgotPassword.middleware.js";
import { startSession, updateHeartbeat, closeSession } from "../middleware/attendance.middleware.js";

// Function to handle admin login
export const loginAsAdmin = async(req, res) => {
    try {
        const { email, password } = req.body;

        //SQL query to find admin by email
        let query = `select * from admins where email = ?`;
        const data = await executeQuery(query, [email]);
        if(data.length===0){
            return res.status(404).send({message: 'user not found'});
        }
        
        // Check if password matches
        const isPasswordCorrect = await bcrypt.compare(password, data[0].password);    
        if(!isPasswordCorrect){
            return res.status(400).json({message: "Invalid Password"});
        }

        // Generate token for the admin
        generateToken(data[0].admin_id, res);

        var username = data[0].first_name + " " + data[0].last_name;

        return res.status(200).json({
            message: "Login successful",
            userId: data[0].admin_id,
            username: username,
        });

    } catch (error) {
        console.error("Error during admin login:", error);
        return res.status(500).send({message: "Internal server Error"});
    }
};

// Function to handle employee login
export const loginAsEmployee = async(req, res) => {
    try {
        const { email, password } = req.body;

        //SQL query to find employee by email
        let query = `select id, employee_id, first_name, last_name, email, password from employees where email = ?`;
        const data = await executeQuery(query, [email]);
        if(data.length===0){
            return res.status(404).send({message: 'user not found'});
        }
        
        // Check if password matches
        const isPasswordCorrect = await bcrypt.compare(password, data[0].password);    
        if(!isPasswordCorrect){
            return res.status(400).json({message: "Invalid Password"});
        }

        // Generate token for the employee
        generateToken(data[0].employee_id, res);
        const sessionId = await startSession(req, data[0].employee_id);

        var username = data[0].first_name + " " + data[0].last_name;

        return res.status(200).json({
            message: "Login successful",
            userId: data[0].employee_id,
            username: username,
            designation: data[0].designation,
            sessionId: sessionId
        });

    } catch (error) {
        console.error("Error during employee login:", error);
        console.log(error);
        return res.status(500).send({message: "Internal server Error"}, error);
    }
};

// Function to handle logout
export const logout = async(req, res) => {
    try {
        const { sessionId } = req.body;
        if (sessionId) {
            await closeSession(sessionId);
        }
        // Clear the JWT cookie
        await res.clearCookie("jwt");
        return res.status(200).json({message: "Logged out successfully"});
    } catch (error) {
        console.error("Error in logout controller"+ error.message);
        return res.status(500).json({message: "Internal server error"});
    }
};

export const heartbeat = async (req, res) => {
    console.log("Inside heartbeat api of auth controller");
    try {
        const { sessionId } = req.body;
        if (!sessionId) {
            return res.status(400).json({ message: "sessionId is required" });
        }
        await updateHeartbeat(sessionId);
        return res.status(200).json({ message: "Heartbeat updated" });
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "error updating heartbeat"});
    }
};

export const logoutBeacon = async (req, res) => {
    try {
        const { sessionId } = JSON.parse(req.body);
        if (sessionId) await closeSession(sessionId);
        res.status(200).end();
    } catch (err) {
        console.error("Beacon logout error:", err);
        res.status(500).end();
    }
};

// Function to handle forgot password for employee
export const forgotPasswordForEmp = async (req, res) => {
    try {
        const { email} = req.body;
        if (!email) return res.status(400).json({ message: "Email required" });
        
        // Check if email exist in the database
        let query = `SELECT * FROM employees WHERE email = ?`;
        const data = await executeQuery(query, [email]);
        if(data.length === 0) {
            return res.status(404).json({ message: "This email does not exist" });
        }
        if(data.length > 1) {
            return res.status(400).json({ message: "Multiple users with same email" });
        }

        // if email exist, generate OTP and send email
        const otp = generateOTP();
        
        // Hash the OTP and set it in an HTTP-only cookie
        await hashOTP(otp, res); 
        // Send OTP email
        await sendEmail(email, otp);
        return res.json({ message: "OTP has been sent to your email" });
    } catch (error) {
        console.error("Error in forgot password controller" + error.message);
        return res.status(400).json(error);
    }
};

// Function to verify OTP 
export const verifyOTP = async (req, res) => {
    try {
        const { otp } = req.body;
        // Get the hashed OTP from the cookie
        const hashedOtp = req.cookies.otp_hash;

        if (!hashedOtp) return res.status(400).json({ message: "OTP expired or not set" });
        // Verify entered OTP and hashed OTP are same
        const isValid = await verifyHashedOTP(otp, hashedOtp);
        if (!isValid) return res.status(400).json({ message: "Invalid OTP" });

        // OTP is valid, clear the otp_hash cookie and set otp_verified cookie
        await res.clearCookie("otp_hash");
        await res.cookie("otp_verified", true, {
            httpOnly: true,
            maxAge: 10 * 60 * 1000, 
            sameSite: process.env.NODE_ENV === "development" ? "strict": "none",
            secure: process.env.NODE_ENV === "development" ? false: true, // Set to true if using HTTPS
            path: "/"
        });

        return res.json({ message: "OTP verified" });
    } catch (error) {
        console.error("Error while verifying OTP"+ error.message);
        return res.status(400).json(error);
    }
};

// Function to reset password for employee
export const resetPasswordForEmp = async(req, res) => {
    try {
        const { email, newPassword } = req.body;
        // Check id OTP is verified
        const isVerified = req.cookies.otp_verified;
        if (!isVerified) return res.status(403).json({ message: "OTP not verified" });

        // Generate hash of new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        let query = `UPDATE employees SET password = ? where email = ?`;
        const resetPasswordResult = await executeQuery(query, [hashedPassword, email]);
        if(resetPasswordResult.affectedRows === 0){
            return res.status(400).json({ message: "Email not found" });
        }
        // If the password is successfully reset, clear the otp_verified cookie
        res.clearCookie("otp_verified");
        return res.json({ message: "Password updated successfully" });
    } catch (error) {
        console.error("Error while reseting password"+ error.message);
        return res.status(400).json(error);
    }
};

// Function to handle forgot password For Admin
export const forgotPasswordForAdmin = async (req, res) => {
    try {
        const { email} = req.body;
        if (!email) return res.status(400).json({ message: "Email required" });
        
        // Check if email exist in the database
        let query = `SELECT * FROM admins WHERE email = ?`;
        const data = await executeQuery(query, [email]);
        if(data.length === 0) {
            return res.status(400).json({ message: "This email does not exist" });
        }
        if(data.length > 1) {
            return res.status(400).json({ message: "Multiple users with same email" });
        }

        // if email exist, generate OTP and send email
        const otp = generateOTP();
        
        // Hash the OTP and set it in an HTTP-only cookie
        await hashOTP(otp, res); 
        // Send OTP email
        await sendEmail(email, otp);
        return res.json({ message: "OTP has been sent to your email" });
    } catch (error) {
        console.error("Error in forgot password controller" + error.message);
        return res.status(400).json(error);
    }
};

// Function to reset password For Admin
export const resetPasswordForAdmin = async(req, res) => {
    try {
        const { email, newPassword } = req.body;
        // Check id OTP is verified
        const isVerified = req.cookies.otp_verified;
        if (!isVerified) return res.status(403).json({ message: "OTP not verified" });

        // Generate hash of new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        let query = `UPDATE admins SET password = ? where email = ?`;
        const resetPasswordResult = await executeQuery(query, [hashedPassword, email]);
        if(resetPasswordResult.affectedRows === 0){
            return res.status(400).json({ message: "Email not found" });
        }
        // If the password is successfully reset, clear the otp_verified cookie
        res.clearCookie("otp_verified");
        return res.json({ message: "Password updated successfully" });
    } catch (error) {
        console.error("Error while reseting password"+ error.message);
        return res.status(400).json(error);
    }
};