import fs from 'fs';
import path from 'path';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import { executeQuery } from "../lib/executeQuery.js";
import multer from 'multer';
import { fileURLToPath } from 'url';
import db from "../lib/db.js";
import { error } from 'console';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Multer storage for resumes
const employeeStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.resolve(__dirname, "../../../uploads/temp");

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const employeeUpload = multer({
  storage: employeeStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
}).fields([
  { name: "aadhar_pic", maxCount: 1 },
  { name: "pan_pic", maxCount: 1 },
  { name: "cancelled_cheque_pic", maxCount: 1 },
]);

// Function to add a new employee
export const addEmployee = async (req, res) => {
  employeeUpload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({message: "File upload failed"});
    }

    let connection;

    try {
      let {
        first_name, middle_name, last_name, gender, dob,
        email, recovery_email, phone,
        aadhar_address, correspondence_address,
        pan_number, aadhar_number,
        bank_name, branch_name, ifsc_code,
        account_number, account_holder_name,
        password, designation,
        percentage, status, selection_date,
        joining_date, view_limit,
        monthly_revenue_target, monthly_candidate_target, admin_id
      } = req.body;

      // ---------------- REQUIRED VALIDATION ----------------
      if (
        !first_name || !last_name || !gender || !dob || !email || !recovery_email || !phone || !aadhar_address || !pan_number || 
        !aadhar_number || !bank_name || !branch_name || !ifsc_code || !account_number || !account_holder_name || !password || !designation ||
        !monthly_revenue_target || !monthly_candidate_target
      ) {
        return res.status(400).json({ message: "All required fields must be provided" });
      }

      // Normalize
      pan_number = pan_number.toUpperCase();
      ifsc_code = ifsc_code.toUpperCase();

      // ---------------- FORMAT VALIDATION ----------------
      if (!validator.isEmail(email))
        return res.status(400).json({ message: "Invalid email format" });

      if (!validator.isEmail(recovery_email))
        return res.status(400).json({ message: "Invalid recovery email format" });

      if (!/^[6-9]\d{9}$/.test(phone))
        return res.status(400).json({ message: "Invalid phone number" });

      if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan_number))
        return res.status(400).json({ message: "Invalid PAN number format" });

      if (!/^\d{12}$/.test(aadhar_number))
        return res.status(400).json({ message: "Invalid Aadhar number format" });

      if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc_code))
        return res.status(400).json({ message: "Invalid IFSC code format" });

      // ---------------- FILE CHECK ----------------
      const files = req.files;

      if (!files || !files.aadhar_pic || !files.pan_pic || !files.cancelled_cheque_pic) {
        return res.status(400).json({
          message: "All documents (Aadhar, PAN, Cheque) are required"
        });
      }

      // ---------------- DB TRANSACTION ----------------
      connection = await db.promise().getConnection();
      await connection.beginTransaction();

      // Duplicate check
      const [existing] = await connection.query(
        `SELECT id FROM employees 
         WHERE email = ? OR aadhar_number = ? OR pan_number = ? OR phone = ?`,
        [email, aadhar_number, pan_number, phone]
      );

      if (existing.length > 0) {
        await connection.rollback();
        return res.status(400).json({ message: "Employee already exists" });
      }

      // Generate employee_id
      const prefix = designation?.toLowerCase() === "admin" ? "ADM" : "EMP";

      const [last] = await connection.query(`SELECT id FROM employees WHERE employee_id LIKE ?  ORDER BY id DESC LIMIT 1`, [`${prefix}%`]);

      const nextId = last.length > 0 ? last[0].id + 1 : 1;
      const employee_id = `${prefix}${String(nextId).padStart(3, "0")}`;

      // ---------------- MOVE FILES ----------------
      const uploadDir = path.resolve(__dirname, "../../../uploads/employees");

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const moveFile = (file, type) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const fileName = `${employee_id}_${type}${ext}`;
        const targetPath = path.join(uploadDir, fileName);
        fs.renameSync(file.path, targetPath);
        return `/uploads/employees/${fileName}`;
      };

      const aadharPath = moveFile(files.aadhar_pic[0], "aadhar");
      const panPath = moveFile(files.pan_pic[0], "pan");
      const chequePath = moveFile(files.cancelled_cheque_pic[0], "cheque");

      // ---------------- PASSWORD HASH ----------------
      const hashedPassword = await bcrypt.hash(password, 10);

      const fullName = `${first_name} ${middle_name || ""} ${last_name}`.trim();

      // ---------------- INSERT EMPLOYEE ----------------
      await connection.query(
        `INSERT INTO employees(
          employee_id, full_name, first_name, middle_name, last_name,
          gender, dob, email, recovery_email, phone,
          aadhar_address, correspondence_address,
          pan_number, aadhar_number,
          aadhar_file_path, pan_file_path, cancelled_cheque_path,
          bank_name, branch_name, ifsc_code,
          account_number, account_holder_name, password,
          designation, percentage,
          selection_date, joining_date,
          status, view_limit
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          employee_id, fullName, first_name, middle_name || "", last_name,
          gender, dob, email, recovery_email, phone,
          aadhar_address, correspondence_address || aadhar_address,
          pan_number, aadhar_number,
          aadharPath, panPath, chequePath,
          bank_name, branch_name, ifsc_code,
          account_number, account_holder_name,
          hashedPassword,
          designation,
          percentage || null,
          selection_date || null,
          joining_date || null,
          status,
          view_limit
        ]
      );

      // ---------------- MONTHLY TARGET ----------------
      const [empRow] = await connection.query(
        `SELECT id FROM employees WHERE employee_id = ?`,
        [employee_id]
      );

      const employee_id_int = empRow.length ? empRow[0].id : null;

      const [adminRow] = await connection.query(
        `SELECT id FROM admins WHERE admin_id = ?`,
        [admin_id]
      );

      const admin_id_int = adminRow.length ? adminRow[0].id : null;

      await connection.query(
        `INSERT INTO monthly_target (employee_id, revenue_target, candidate_target, assigned_by)
         VALUES (?, ?, ?, ?)`,
        [employee_id_int, monthly_revenue_target, monthly_candidate_target, admin_id_int]
      );

      await connection.commit();
      connection.release();

      return res.status(200).json({
        message: "Employee added successfully",
        employeeId: employee_id
      });

    } catch (error) {
      if (connection) {
        await connection.rollback();
        connection.release();
      }
      // Delete remaining temp files
      if (req.files) {
        Object.values(req.files).flat().forEach(file => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
      }
      console.error("Error during adding employee:", error);
      return res.status(500).send({message: "Failed to add employee"});
    }
  });
};

export const registerEmployee = async (req, res) => {
  employeeUpload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({message: "File upload failed"});
    }

    let connection;

    try {

      let {
        first_name, middle_name, last_name, gender, dob,
        email, recovery_email, phone,
        aadhar_address, correspondence_address,
        pan_number, aadhar_number,
        bank_name, branch_name, ifsc_code,
        account_number, account_holder_name,
        password
      } = req.body;

      // ---------------- REQUIRED CHECK ----------------
      if (
        !first_name || !last_name || !gender || !dob || !email ||
        !recovery_email || !phone || !aadhar_address ||
        !pan_number || !aadhar_number ||
        !bank_name || !branch_name || !ifsc_code ||
        !account_number || !account_holder_name || !password
      ) {
        return res.status(400).json({ message: "All required fields must be provided" });
      }

      // Normalize
      pan_number = pan_number.toUpperCase();
      ifsc_code = ifsc_code.toUpperCase();

      // ---------------- VALIDATION ----------------
      if (!validator.isEmail(email))
        return res.status(400).json({ message: "Invalid email format" });

      if (!/^[6-9]\d{9}$/.test(phone))
        return res.status(400).json({ message: "Invalid phone number" });

      if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan_number))
        return res.status(400).json({ message: "Invalid PAN number format" });

      if (!/^\d{12}$/.test(aadhar_number))
        return res.status(400).json({ message: "Invalid Aadhar number format" });

      if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc_code))
        return res.status(400).json({ message: "Invalid IFSC code format" });

      const files = req.files;

      if (!files || !files.aadhar_pic || !files.pan_pic || !files.cancelled_cheque_pic) {
        return res.status(400).json({
          message: "All documents (Aadhar, PAN, Cheque) are required"
        });
      }

      // ---------------- DB START ----------------
      connection = await db.promise().getConnection();
      await connection.beginTransaction();

      // Duplicate check
      const [existing] = await connection.query(
        `SELECT id FROM employees 
         WHERE email = ? OR aadhar_number = ? OR pan_number = ? OR phone = ?`,
        [email, aadhar_number, pan_number, phone]
      );

      if (existing.length > 0) {
        await connection.rollback();
        return res.status(400).json({ message: "Employee already exists" });
      }

      // Generate employee ID
      const [last] = await connection.query(`SELECT id FROM employees  WHERE employee_id LIKE 'EMP%'  ORDER BY id DESC LIMIT 1`);

      const nextId = last.length > 0 ? last[0].id + 1 : 1;
      const employee_id = `EMP${String(nextId).padStart(3, "0")}`;

      // Move files permanently
      const uploadDir = path.resolve(__dirname, "../../../uploads/employees");

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const moveFile = (file, type) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const fileName = `${employee_id}_${type}${ext}`;
        const targetPath = path.join(uploadDir, fileName);
        fs.renameSync(file.path, targetPath);
        return `/uploads/employees/${fileName}`;
      };

      const aadharPath = moveFile(files.aadhar_pic[0], "aadhar");
      const panPath = moveFile(files.pan_pic[0], "pan");
      const chequePath = moveFile(files.cancelled_cheque_pic[0], "cheque");

      const hashedPassword = await bcrypt.hash(password, 10);

      const fullName = `${first_name} ${middle_name || ""} ${last_name}`.trim();

      await connection.query(
        `INSERT INTO employees(
          employee_id, full_name, first_name, middle_name, last_name,
          gender, dob, email, recovery_email, phone,
          aadhar_address, correspondence_address,
          pan_number, aadhar_number,
          aadhar_file_path, pan_file_path, cancelled_cheque_path,
          bank_name, branch_name, ifsc_code,
          account_number, account_holder_name, password
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          employee_id, fullName, first_name, middle_name || "", last_name,
          gender, dob, email, recovery_email, phone,
          aadhar_address, correspondence_address || aadhar_address,
          pan_number, aadhar_number,
          aadharPath, panPath, chequePath,
          bank_name, branch_name, ifsc_code,
          account_number, account_holder_name, hashedPassword
        ]
      );

      await connection.commit();
      connection.release();

      return res.status(200).json({
        message: "Employee registered successfully",
        employee_id
      });

    } catch (error) {
      if (connection) {
        await connection.rollback();
        connection.release();
      }
      // Delete remaining temp files
      if (req.files) {
        Object.values(req.files).flat().forEach(file => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
      }
      console.error(error);
      return res.status(500).json({message: "An error occurred while registering employee"});
    }
  });
};

// Function to get all employees with their PIP status
export const getAllEmployees = async (req, res) => {
    try {
        // SQL query to fetch all employees with their PIP status
        // const query = `SELECT e.id, e.employee_id, e.full_name, e.email, e.phone, e.designation, e.status, e.salary, 
        //                 e.percentage, e.joining_date,
        //                 p.id AS pip_id, 
        //                 p.pip_start_date, 
        //                 p.pip_end_date, 
        //                 p.pip_reason, 
        //                 p.status AS pip_status
        //                 FROM employees e 
        //                 LEFT JOIN employee_pip_records p 
        //                 ON e.employee_id = p.employee_id AND p.status = 'active'
        //                 WHERE e.designation != 'admin'`;

        const query = `SELECT 
                      e.id, 
                      e.employee_id, 
                      e.full_name, 
                      e.email, 
                      e.phone, 
                      e.designation, 
                      e.status, 
                      e.salary, 
                      e.percentage, 
                      e.joining_date,
                      p.id AS pip_id, 
                      p.pip_start_date, 
                      p.pip_end_date, 
                      p.pip_reason, 
                      p.status AS pip_status,
                      CASE 
                          WHEN EXISTS (
                              SELECT 1 
                              FROM attendance_sessions a 
                              WHERE a.employee_id COLLATE utf8mb4_unicode_ci = e.employee_id COLLATE utf8mb4_unicode_ci
                              AND a.status = 'active'
                          ) THEN 'active'
                          ELSE 'expired'
                      END AS is_online
                  FROM employees e 
                  LEFT JOIN employee_pip_records p 
                      ON e.employee_id COLLATE utf8mb4_unicode_ci = p.employee_id COLLATE utf8mb4_unicode_ci
                      AND p.status = 'active'
                  WHERE e.designation != 'admin'`;
        const data = await executeQuery(query);

        // Fetch online status for each employee
        // const onlineStatus = await executeQuery(`SELECT employee_id, status FROM attendance_sessions`);
        // const onlineStatusMap = Object.fromEntries(onlineStatus.map(row => [row.employee_id, row.is_online]));
        // data.forEach(emp => {
        //     emp.is_online = onlineStatusMap[emp.employee_id] || 0;
        // });


        if (data.length > 0) {
            return res.status(200).json(data);
        } else {
            return res.status(404).json({ message: "No employee data found" });
        }

    } catch (error) {
        console.error("Error during fetching employees:", error);
        return res.status(500).send({ message: "Internal Server Error" });
    }
}

// Function to get employee details by ID
export const getEmployeeById = async (req, res) => {
    try {
        var empId = req.query.empId;
        const employeeIdINT = await executeQuery(`SELECT id FROM employees WHERE employee_id = ?`, [empId]);
        const employee_id_int = employeeIdINT.length ? employeeIdINT[0].id : null;
        let query = `
            SELECT 
                e.*, 
                mt.revenue_target,
                mt.candidate_target
            FROM employees e
            LEFT JOIN (
                SELECT *
                FROM monthly_target
                WHERE employee_id = ?
                ORDER BY created_at DESC
                LIMIT 1
            ) mt ON e.id = mt.employee_id
            WHERE e.id = ?
        `;

        const data = await executeQuery(query, [employee_id_int, employee_id_int]);

        if (data.length > 0) {
            res.status(200).json(data);
        }
        else {
            res.status(400).send({ message: "Failed to fetch employee details" });
        }

    } catch (error) {
        console.error("Error during fetching employee:", error);
        res.status(400).send({message: "Internal server error"});
    }
}

// Function to update employee details
export const updateEmployee = async (req, res) => {
  employeeUpload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        message: err.message || "File upload failed",
      });
    }
    let connection;

    try {
      let {
        employee_id, first_name, middle_name, last_name,
        gender, dob, email, recovery_email, phone, aadhar_address, correspondence_address, pan_number, aadhar_number,
        bank_name, branch_name, ifsc_code, account_number, account_holder_name, password, designation,
        percentage, status, selection_date, joining_date, view_limit,
        monthly_revenue_target, monthly_candidate_target, admin_id
      } = req.body;

      if (!employee_id) {
        return res.status(400).json({ message: "Employee ID is required" });
      }

      // Normalize
      pan_number = pan_number?.toUpperCase();
      ifsc_code = ifsc_code?.toUpperCase();

      // ---------------- BASIC VALIDATION ----------------
      if (!validator.isEmail(email))
        return res.status(400).json({ message: "Invalid email format" });

      if (!validator.isEmail(recovery_email))
        return res.status(400).json({ message: "Invalid recovery email format" });

      if (!/^[6-9]\d{9}$/.test(phone))
        return res.status(400).json({ message: "Invalid phone number" });

      if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan_number))
        return res.status(400).json({ message: "Invalid PAN number format" });

      if (!/^\d{12}$/.test(aadhar_number))
        return res.status(400).json({ message: "Invalid Aadhar number format" });

      if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc_code))
        return res.status(400).json({ message: "Invalid IFSC code format" });

      // ---------------- DB TRANSACTION ----------------
      connection = await db.promise().getConnection();
      await connection.beginTransaction();

      // Check employee exists
      const [existingEmployee] = await connection.query(
        `SELECT * FROM employees WHERE employee_id = ?`,
        [employee_id]
      );

      if (existingEmployee.length === 0) {
        await connection.rollback();
        return res.status(400).json({ message: "Employee not found" });
      }

      // Duplicate check (excluding current employee)
      const [duplicate] = await connection.query(
        `SELECT id FROM employees
         WHERE (email = ? OR aadhar_number = ? OR pan_number = ? OR phone = ?)
         AND employee_id != ?`,
        [email, aadhar_number, pan_number, phone, employee_id]
      );

      if (duplicate.length > 0) {
        await connection.rollback();
        return res.status(400).json({
          message: "Email, Aadhar, PAN or phone already exists for another employee"
        });
      }

      // ---------------- FILE HANDLING ----------------
      const files = req.files;
      const uploadDir = path.resolve(__dirname, "../../../uploads/employees");

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const moveFile = (file, type) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const fileName = `${employee_id}_${type}${ext}`;
        const targetPath = path.join(uploadDir, fileName);
        fs.renameSync(file.path, targetPath);
        return `/uploads/employees/${fileName}`;
      };

      let aadharPath, panPath, chequePath;

      if (files?.aadhar_pic) {
        aadharPath = moveFile(files.aadhar_pic[0], "aadhar");
      }

      if (files?.pan_pic) {
        panPath = moveFile(files.pan_pic[0], "pan");
      }

      if (files?.cancelled_cheque_pic) {
        chequePath = moveFile(files.cancelled_cheque_pic[0], "cheque");
      }

      // ---------------- PASSWORD ----------------
      let hashedPassword = existingEmployee[0].password;

      if (password && password.trim() !== "") {
        hashedPassword = await bcrypt.hash(password, 10);
      }

      const fullName = `${first_name} ${middle_name || ""} ${last_name}`.trim();

      // ---------------- BUILD UPDATE QUERY ----------------
      const updateFields = [
        "full_name = ?",
        "first_name = ?",
        "middle_name = ?",
        "last_name = ?",
        "gender = ?",
        "dob = ?",
        "email = ?",
        "recovery_email = ?",
        "phone = ?",
        "aadhar_address = ?",
        "correspondence_address = ?",
        "pan_number = ?",
        "aadhar_number = ?",
        "bank_name = ?",
        "branch_name = ?",
        "ifsc_code = ?",
        "account_number = ?",
        "account_holder_name = ?",
        "password = ?",
        "designation = ?",
        "percentage = ?",
        "selection_date = ?",
        "joining_date = ?",
        "status = ?",
        "view_limit = ?"
      ];

      const updateValues = [
        fullName,
        first_name,
        middle_name || "",
        last_name,
        gender,
        dob,
        email,
        recovery_email,
        phone,
        aadhar_address,
        correspondence_address || aadhar_address,
        pan_number,
        aadhar_number,
        bank_name,
        branch_name,
        ifsc_code,
        account_number,
        account_holder_name,
        hashedPassword,
        designation,
        percentage || null,
        selection_date || null,
        joining_date || null,
        status,
        view_limit
      ];

      if (aadharPath) {
        updateFields.push("aadhar_file_path = ?");
        updateValues.push(aadharPath);
      }

      if (panPath) {
        updateFields.push("pan_file_path = ?");
        updateValues.push(panPath);
      }

      if (chequePath) {
        updateFields.push("cancelled_cheque_path = ?");
        updateValues.push(chequePath);
      }

      updateValues.push(employee_id);

      await connection.query(
        `UPDATE employees SET ${updateFields.join(", ")} WHERE employee_id = ?`,
        updateValues
      );

      // ---------------- MONTHLY TARGET INSERT ----------------
      const [empRow] = await connection.query(
        `SELECT id FROM employees WHERE employee_id = ?`,
        [employee_id]
      );

      const employee_id_int = empRow.length ? empRow[0].id : null;

      const [adminRow] = await connection.query(
        `SELECT id FROM admins WHERE admin_id = ?`,
        [admin_id]
      );

      const admin_id_int = adminRow.length ? adminRow[0].id : null;

      await connection.query(
        `INSERT INTO monthly_target (employee_id, revenue_target, candidate_target, assigned_by)
         VALUES (?, ?, ?, ?)`,
        [employee_id_int, monthly_revenue_target, monthly_candidate_target, admin_id_int]
      );

      await connection.commit();
      connection.release();
      return res.status(200).send({message: "Employee updated successfully"});
    } catch (error) {
      if (connection) {
        await connection.rollback();
        connection.release();
      }
      // Delete remaining temp files
      if (req.files) {
        Object.values(req.files).flat().forEach(file => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
      }
      console.error("Error updating employee:", error);
      return res.status(500).json({message: "Failed to update employee"});
    }
  });
};

// Function to delete an employee
export const deleteEmployee = async (req, res) => {
    let connection;
    try {
        var empId = req.query.empId;
        
        // Get database connection and start transaction
        connection = await db.promise().getConnection();
        await connection.beginTransaction();

        // Check if employee exists
        const [data] = await connection.query(
            `SELECT * FROM employees WHERE employee_id = ?`,
            [empId]
        );
        if (data.length === 0) {
            await connection.rollback();
            connection.release();
            return res.status(400).send({ message: "Employee not found" });
        }

        // SQL query to delete employee
        const [result] = await connection.query(
            `DELETE FROM employees WHERE employee_id = ?`,
            [empId]
        );
        
        if (result.affectedRows > 0) {
            await connection.commit();
            connection.release();
            res.status(200).send({ message: "Employee deleted successfully" });
        } else {
            await connection.rollback();
            connection.release();
            res.status(400).send({ message: "Failed to delete employee" });
        }
    } catch (error) {
        if (connection) {
            await connection.rollback();
            connection.release();
        }
        console.error("Error during deleting employee:", error);
        res.status(400).send({ message: "Failed to delete employee" });
    }
}

// Function to mark PIP
export const markAsPIP = async (req, res) => {
    try {
        const { pip_start_date, pip_end_date, pip_reason, admin_name } = req.body;
        const empId = req.query.empId;

        // Validate required fields
        if (!empId || !pip_start_date || !pip_end_date || !admin_name) {
            return res.status(400).json({ message: "Please fill all required fields" });
        }

        const start = new Date(pip_start_date);
        const end = new Date(pip_end_date);

        if (end <= start) {
            return res.status(400).json({ message: "End date must be after start date" });
        }

        // Check if employee has an active PIP
        let query = `
            SELECT * 
            FROM employee_pip_records 
            WHERE employee_id = ? AND status = ?
        `;

        const existingPIP = await executeQuery(query, [empId, "active"]);

        if (existingPIP.length > 0) {
            return res.status(400).json({ message: "Employee has active PIP" });
        }

        // Insert PIP record
        query = `
            INSERT INTO employee_pip_records 
            (employee_id, pip_start_date, pip_end_date, pip_reason, status, created_by)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        const params = [
            empId,
            pip_start_date,
            pip_end_date,
            pip_reason,
            "active",
            admin_name
        ];

        const data = await executeQuery(query, params);

        if (data.affectedRows > 0) {
            return res.status(200).json({ message: "Employee marked as PIP successfully" });
        }

        return res.status(400).json({ message: "Failed to mark employee as PIP" });

    } catch (error) {
        console.error("Error during marking employee as PIP:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Function to end PIP
export const endPIP = async (req, res) => {
    try {
        var {pip_id} = req.body;

        // SQL query to end PIP
        var query = `UPDATE employee_pip_records SET status = 'completed' WHERE id = ? AND status = 'active'`;
        const data = await executeQuery(query, [pip_id]);
        if (data.affectedRows > 0) {
            res.status(200).json({ message: "PIP ended successfully" });
        } else {
            res.status(400).json({ message: "Failed to end PIP or PIP not found" });
        }
    } catch (error) {
        console.error("Error during ending PIP:", error);
        return res.status(500).json({ message: "Internal server error"});
        
    }
}

// Function to add LOP (Loss of Pay)
export const addLOP = async (req, res) => {
    try {
        const empId = req.query.empId;
        const { lop_reason, lop_date, lop_amount } = req.body;

        if (!empId || !lop_reason || !lop_date || !lop_amount) {
            return res.status(400).json({ message: "Please fill all required fields" });
        }

        const query = `
            INSERT INTO employee_lop_records 
            (employee_id, lop_reason, lop_date, lop_amount) 
            VALUES (?, ?, ?, ?)
        `;

        const params = [empId, lop_reason, lop_date, lop_amount];

        const data = await executeQuery(query, params);

        if (data.affectedRows > 0) {
            return res.status(200).json({ message: "LOP added successfully" });
        }

        return res.status(400).json({ message: "Failed to add LOP" });

    } catch (error) {
        console.error("Error during adding LOP:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getEmployeePortfolio = async (req, res) => {
    const empId = req.query.empId;
    const { start_date, end_date } = req.body;
    try {
        const [employeeIdINT] = await executeQuery(`SELECT id FROM employees WHERE employee_id = ?`, [empId]);
        const employee_id_int = employeeIdINT.length ? employeeIdINT[0].id : null;

        let query = `SELECT COUNT(*) as totalcandidates FROM employee_assignments WHERE employee_id = ? AND updated_at BETWEEN ? AND ?`;
        const [totalcandidates] = await executeQuery(query, [employee_id_int, start_date, end_date]);

        const statsData = await executeQuery(`SELECT ca.assignment_status, COUNT(*) AS count FROM candidate_assignments ca
                        JOIN (
                            SELECT candidate_id, MAX(id) AS latest_id
                            FROM employee_assignments
                            GROUP BY candidate_id
                        ) latest ON latest.candidate_id = ca.candidate_id
                        JOIN employee_assignments ea ON ea.id = latest.latest_id
                        WHERE ea.employee_id = ? AND DATE(ca.updated_at) BETWEEN ? AND ?
                        GROUP BY ca.assignment_status ORDER BY count DESC`, [empId, start_date, end_date]);

        const total = totalcandidates.totalcandidates;
        const completelyJoinedCount = statsData.find(item => item.assignment_status === "completely_joined")?.count || 0;
        const joinedCount = statsData.find(item => item.assignment_status === "joined")?.count || 0;
        const dropoutCount = statsData.find(item => item.assignment_status === "dropout")?.count || 0;

        const successRate = total > 0 ? Number((((completelyJoinedCount + joinedCount) / total) * 100).toFixed(1)) : 0;

        const conversionRate = total > 0 ? Number((completelyJoinedCount / total) * 100).toFixed(1) : 0;

        const dropoutRate = total > 0 ? Number((dropoutCount / total) * 100).toFixed(1) : 0;

        const totalRevenue = await executeQuery(`SELECT COALESCE(SUM(p.real_payout_amount), 0) AS total_revenue
                                                    FROM employee_assignments ea
                                                    JOIN (
                                                        SELECT candidate_id, MAX(id) AS latest_id
                                                        FROM employee_assignments
                                                        GROUP BY candidate_id
                                                    ) latest ON ea.id = latest.latest_id
                                                    JOIN candidate_assignments ca ON ca.candidate_id = ea.candidate_id
                                                    JOIN processes p ON p.id = ca.process_id
                                                    WHERE 
                                                        ea.employee_id = ? AND DATE(ca.updated_at) BETWEEN ? AND ? 
                                                        AND ca.assignment_status = 'completely_joined'`, [empId, start_date, end_date]);
                                                        
        const totalActions =await executeQuery(`SELECT COUNT(*) AS total_actions FROM candidate_work_actions WHERE employee_id = ? AND DATE(action_date) BETWEEN ? AND ?`, [empId, start_date, end_date]);
        
        const phoneCallCount = await executeQuery(`SELECT COUNT(*) AS phone_calls FROM candidate_call_logs WHERE employee_id = ? AND DATE(call_date) BETWEEN ? AND ?`, [empId, start_date, end_date]);

        const lopData = await executeQuery(`SELECT COUNT(*) as count, SUM(lop_amount) as total_amount
                                            FROM employee_lop_records WHERE employee_id = ? AND DATE(lop_date) BETWEEN ? AND ?`, [empId, start_date, end_date]);
 
        const response = {
            totalcandidates,
            statsData,
            successRate,
            conversionRate,
            dropoutRate,
            totalRevenue: totalRevenue[0]?.total_revenue || 0,
            totalActions: totalActions[0]?.total_actions || 0,
            phoneCallCount: phoneCallCount[0]?.phone_calls || 0,
            lopData
        };
        return res.status(200).json(response);
    } catch (error) {
        console.error("Error while fetching details for employee portfolio: ", error);
        return res.status(500).send(error);
    }
}

export const employeeCallHistory = async (req, res) => {
    const empId = req.query.empId;
    const { start_date, end_date } = req.body;
    try {
        let  query =`SELECT * FROM candidate_call_logs WHERE employee_id = ? AND DATE(call_date) BETWEEN ? AND ? ORDER BY call_date DESC`;
        const callHistory = await executeQuery(query, [empId, start_date, end_date]);
        return res.status(200).json(callHistory);
    } catch (error) {
        console.error("Error while fetching details for employee call history: ", error);
        return res.status(500).send(error);
    }
}

export const completedCandidates = async (req, res) => {
    const empId = req.query.empId;
    const { start_date, end_date } = req.body;
    try {
        let  query =`SELECT
                        ca.candidate_id,
                        c.name AS candidate_name,
                        p.id AS process_id,
                        p.process_name,
                        p.real_payout_amount,
                        cl.client_name,
                        ca.assignment_status,
                        ca.updated_at
                    FROM candidate_assignments ca
                    JOIN candidates c ON c.id = ca.candidate_id
                    JOIN processes p ON p.id = ca.process_id
                    JOIN clients cl ON cl.id = p.client_id
                    JOIN (SELECT candidate_id, MAX(id) AS latest_id FROM employee_assignments GROUP BY candidate_id) latest ON latest.candidate_id = ca.candidate_id
                    JOIN employee_assignments ea ON ea.id = latest.latest_id
                    WHERE ea.employee_id = ?
                        AND ca.assigned_at >= ?
                        AND ca.assigned_at < DATE_ADD(?, INTERVAL 1 DAY)
                        AND ca.assignment_status IN (
                            'joined',
                            'clawback',
                            'invoice',
                            'completely_joined'
                        )`;
        const completed = await executeQuery(query, [empId, start_date, end_date]);
        return res.status(200).json(completed);
    } catch (error) {
        console.error("Error while fetching details for completed candidates: ", error);
        return res.status(500).send(error);
    }
}