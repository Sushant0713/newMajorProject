import { executeQuery } from "../lib/executeQuery.js";

export const getAllLops = async (req, res) => {
    let query = `
        SELECT 
        lr.id,
        lr.employee_id,
        lr.lop_reason,
        lr.lop_date,
        lr.lop_amount,
        lr.created_at,
        e.full_name AS employee_name,
        e.email,
        e.phone
        FROM employee_lop_records lr
        JOIN employees e ON lr.employee_id = e.employee_id
        WHERE e.designation = 'salaryemp'
        ORDER BY lr.lop_date DESC, lr.created_at DESC
    `;

    try {
        const records = await executeQuery(query);

        const total_amount = records.reduce((sum, r) => sum + Number(r.lop_amount || 0), 0);
        const currentMonth = new Date().toISOString().slice(0, 7);

        const thisMonth = records.filter(r => {
            if (!r.lop_date) return false; 
            return new Date(r.lop_date).toISOString().slice(0, 7) === currentMonth;
        });
        const this_month_amount = thisMonth.reduce((sum, r) => sum + Number(r.lop_amount || 0), 0);

        res.json({
        records,
        stats: {
            total_records: records.length,
            total_amount,
            this_month_count: thisMonth.length,
            this_month_amount
        }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


export const addLop = async (req, res) => {
    const employee_id = req.query.empId;
    const { lop_reason, lop_date, lop_amount } = req.body;

    if (!employee_id || !lop_reason || !lop_date || !lop_amount) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        let query = `INSERT INTO employee_lop_records (employee_id, lop_reason, lop_date, lop_amount) VALUES (?, ?, ?, ?)`;
        const result = await executeQuery(query, [employee_id, lop_reason, lop_date, lop_amount]);

        if (result.affectedRows === 0) {
            return res.status(400).json({ message: 'Failed to add LOP record' });
        }   

        return res.status(200).json({ message: 'LOP record added successfully' });
    } catch (err) {
        return res.status(500).json({ message: "Internal server error" });
    }
};


export const deleteLop = async (req, res) => {
    const lop_id = req.query.lopId;

    if (!lop_id) {
        return res.status(400).json({ message: 'LOP ID required' });
    }

    try {
        let query = `DELETE FROM employee_lop_records WHERE id = ?`;
        const result = await executeQuery(query, [lop_id]);
        return res.json({ message: 'LOP record deleted successfully' });
    } catch (err) {
        return res.status(500).json({ message: "Internal server error" });
    }
};


export const getSalaryEmployee = async (req, res) => {
    try {
        let query = `SELECT employee_id, full_name, email, phone, designation
                    FROM employees
                    WHERE designation = 'salaryemp' AND status = 'active'
                    ORDER BY full_name ASC`;

        const employees = await executeQuery(query);
        if (!Array.isArray(employees) || employees.length === 0) {
        return res.status(404).json({ message: "No salary employees found" });
        }

        return res.json({ employees });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


