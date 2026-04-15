import { executeQuery } from "../lib/executeQuery.js";
import db from "../lib/db.js";
import { format } from "date-fns";

export const getPayouts = async (req, res) => {
    try {
        const search = req.body.search || '';
        const candidate_filter = req.body.candidate_name || '';
        const employee_filter = req.body.employee_name || '';
        const process_filter = req.body.process || '';
        const status_filter = req.body.status || '';
        var query = `SELECT
                        c.id AS candidate_id,
                        c.name AS candidate_name,
                        c.email AS candidate_email,
                        p.id AS process_id,
                        p.process_name,
                        p.payout_type,
                        p.payout_amount,
                        p.real_payout_amount,
                        p.clawback_duration,
                        p.invoice_clear_time,
                        e.id AS employee_table_id,
                        e.employee_id,
                        e.full_name AS employee_name,
                        e.show_payout,
                        e.percentage AS employee_percentage,
                        pay.id AS payout_id,
                        pay.status AS payout_status,
                        pay.calculated_amount,
                        pay.clawback_start,
                        pay.clawback_end,
                        pay.invoice_start,
                        pay.invoice_end,
                        pay.payout_basis,
                        pay.employee_percentage AS stored_employee_percentage
                    FROM candidate_assignments ca
                    JOIN candidates c ON c.id = ca.candidate_id
                    JOIN processes p ON p.id = ca.process_id
                    JOIN (
                        SELECT candidate_id, MAX(id) AS latest_id
                        FROM employee_assignments
                        GROUP BY candidate_id
                    ) latest ON latest.candidate_id = ca.candidate_id
                    JOIN employee_assignments ea ON ea.id = latest.latest_id
                    JOIN employees e ON e.employee_id = ea.employee_id
                    LEFT JOIN payouts pay ON pay.candidate_id = ca.candidate_id  AND pay.employee_id = ea.employee_id
                    WHERE ca.assignment_status IN ('joined','clawback','invoice','approved','completely_joined','rejected')`;

        // Add search and filter conditions
        const where_conditions = [];

        if (search && search.trim() !== '') {
            where_conditions.push(`(c.name LIKE '%${search}%' OR c.email LIKE '%${search}%' OR e.full_name LIKE '%${search}%' OR p.process_name LIKE '%${search}%')`);
        }

        if (candidate_filter && candidate_filter.trim() !== '') {
            where_conditions.push(`c.name LIKE '%${candidate_filter}%'`);
        }

        if (employee_filter && employee_filter.trim() !== '') {
            where_conditions.push(`e.full_name LIKE '%${employee_filter}%'`);
        }

        if (process_filter && process_filter.trim() !== '') {
            where_conditions.push(`TRIM(LOWER(p.process_name)) = TRIM(LOWER('${process_filter}'))`);
        }

        if (status_filter && status_filter.trim() !== '') {
            if (status_filter === 'not_generated') {
                where_conditions.push(`pay.status IS NULL`);
            } else {
                where_conditions.push(`TRIM(LOWER(pay.status)) = TRIM(LOWER('${status_filter}'))`);
            }
        }

        if (where_conditions.length > 0) {
            query += " AND " + where_conditions.join(" AND ");
        }

        query += " ORDER BY ca.updated_at DESC";

        const payouts = await executeQuery(query);
        
        if(payouts.length === 0) {
            return res.status(200).json([]);
        }
        
        res.status(200).json(payouts);
    } catch (error) {
        console.error("Error while fetching payouts:", error);
        res.status(400).send(error);
    }
};

// Get unique process names for filter dropdowns
export const getProcessNames = async (req, res) => {
    try {
        const query = `SELECT DISTINCT process_name FROM processes ORDER BY process_name`;
        const processes = await executeQuery(query);
        
        const processNames = processes.map(row => row.process_name);
        
        res.status(200).json(processNames);
    } catch (error) {
        console.error("Error while fetching process names:", error);
        res.status(400).send(error);
    }
};

// Get status options
export const getStatusOptions = async (req, res) => {
    try {
        const status_options = ['Payout Not Generated', 'clawback', 'invoice_clear', 'approved', 'completely_joined', 'rejected'];
        res.status(200).json(status_options);
    } catch (error) {
        console.error("Error while fetching status options:", error);
        res.status(400).send(error);
    }
};

// get condidate status history
export const getCandidateStatusHistory = async(req, res) => {
    try {
        const candidate_id = req.query.candidate_id;
        const query = `SELECT 
                            csh.id,
                            csh.candidate_id,
                            csh.employee_id,
                            csh.old_status,
                            csh.new_status,
                            csh.change_reason,
                            csh.changed_at,
                            e.first_name,
                            e.last_name
                        FROM candidate_status_history csh
                        LEFT JOIN employees e 
                            ON csh.employee_id = e.employee_id
                        WHERE csh.candidate_id = ?
                        ORDER BY csh.changed_at DESC`;
        const history = await executeQuery(query, [candidate_id]);
        if(history.length === 0){
            return res.status(400).send({ message: "No history for this candidate" });
        }

        return res.status(200).json(history);

    } catch (error) {
        console.error("Error while fetching candidate status history:", error);
        res.status(400).send(error);
    }
};

// Update candidate_assignments.assignment_status based on payout status
export const updateCandidateAssignmentStatus = async (connection, candidate_id, payout_status) => {
    const statusMapping = {
        waiting_period: "joined",
        clawback: "clawback",
        invoice_clear: "invoice",
        approved: "approved",
        completely_joined: "completely_joined",
        rejected: "rejected"
    };

    const assignment_status = statusMapping[payout_status] || "joined";

    const query = `
        UPDATE candidate_assignments
        SET assignment_status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE candidate_id = ?
    `;

    await connection.query(query, [assignment_status, candidate_id]);

    return true;
};

export const generatePayout = async (req, res) => {
    let connection;
    try {
        connection = await db.promise().getConnection();
        await connection.beginTransaction();
        const { candidate_id } = req.body;

        const exists = await connection.query(
            `SELECT id, status FROM payouts WHERE candidate_id = ?`,
            [candidate_id]
        );

        if (exists[0].length) {
            if (exists[0][0].status === "rejected") {
                await connection.query(
                    `UPDATE payouts 
                    SET status = 'joined', updated_at = CURRENT_TIMESTAMP 
                    WHERE id = ?`,
                    [exists[0][0].id]
                );
                await updateCandidateAssignmentStatus(connection, candidate_id, "rejected");
                await connection.commit();
                return res.json({ message: "Rejected payout reactivated successfully" });
            }
        }

        const [data] = await connection.query(`
            SELECT 
                c.id candidate_id,
                ea.employee_id,
                ca.process_id,
                p.payout_type,
                p.payout_amount,
                p.real_payout_amount,
                p.clawback_duration,
                p.invoice_clear_time,
                e.percentage,
                DATE(csh.changed_at) joined_date
            FROM candidate_status_history csh
            JOIN candidates c ON c.id = csh.candidate_id
            JOIN candidate_assignments ca ON ca.candidate_id = c.id
            JOIN processes p ON p.id = ca.process_id
            JOIN (
                SELECT candidate_id, MAX(id) AS latest_id
                FROM employee_assignments
                GROUP BY candidate_id
            ) latest_ea ON latest_ea.candidate_id = c.id
            JOIN employee_assignments ea ON ea.id = latest_ea.latest_id
            JOIN employees e ON e.employee_id = ea.employee_id
            WHERE c.id = ? AND csh.new_status = 'joined'
            ORDER BY csh.id DESC LIMIT 1
        `, [candidate_id]);

        if (!data.length) {
            return res.status(400).json({ message: "Candidate not joined" });
        }

        const c = data[0];
        // const base =
        //     c.show_payout === "actual"
        //         ? c.real_payout_amount
        //         : c.payout_amount;

        const amount = (c.real_payout_amount * (c.percentage || 0)) / 100;

        const joined = new Date(c.joined_date);
        const clawbackEnd = new Date(joined);
        clawbackEnd.setDate(clawbackEnd.getDate() + c.clawback_duration);

        const invoiceStart = new Date(clawbackEnd);
        invoiceStart.setDate(invoiceStart.getDate() + 1);

        const invoiceEnd = new Date(invoiceStart);
        invoiceEnd.setDate(invoiceEnd.getDate() + c.invoice_clear_time);

        await connection.query(`
            INSERT INTO payouts
            (candidate_id, employee_id, process_id, payout_type,
             employee_percentage, calculated_amount, joined_date,
             clawback_start, clawback_end, invoice_start, invoice_end, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'joined')
        `, [
            c.candidate_id,
            c.employee_id,
            c.process_id,
            c.payout_type,
            c.percentage || 0,
            amount,
            c.joined_date,
            joined,
            clawbackEnd,
            invoiceStart,
            invoiceEnd
        ]);

        await updateCandidateAssignmentStatus(connection, candidate_id, "waiting_period");

        await connection.query(`
            INSERT INTO candidate_status_history
            (candidate_id, employee_id, old_status, new_status, change_reason)
            VALUES (?, ?, 'joined', 'joined', 'Payout generated')
        `, [candidate_id, c.employee_id]);

        await connection.commit();

        res.json({ message: "Payout generated successfully" });

    } catch (err) {
        await connection.rollback();
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    } finally {
        if (connection) connection.release();
    }
};

export const startClawback = async (req, res) => {
    let connection;
    try {
        connection = await db.promise().getConnection();
        await connection.beginTransaction();
        const { candidate_id } = req.body;

        const query = `
            SELECT 
                c.id AS candidate_id,
                ea.employee_id,
                ca.process_id,
                p.payout_type,
                p.payout_amount,
                p.real_payout_amount,
                p.clawback_duration,
                p.invoice_clear_time,
                e.show_payout,
                e.percentage,
                DATE(csh.changed_at) AS joined_date
            FROM candidate_status_history csh
            JOIN candidates c ON c.id = csh.candidate_id
            JOIN candidate_assignments ca ON ca.candidate_id = c.id
            JOIN processes p ON p.id = ca.process_id
            JOIN (
                SELECT candidate_id, MAX(id) AS latest_id
                FROM employee_assignments
                GROUP BY candidate_id
            ) latest_ea ON latest_ea.candidate_id = c.id
            JOIN employee_assignments ea ON ea.id = latest_ea.latest_id
            JOIN employees e ON e.employee_id = ea.employee_id
            WHERE c.id = ?
              AND csh.new_status = 'joined'
            ORDER BY csh.id DESC
            LIMIT 1
        `;

        const [rows] = await connection.query(query, [candidate_id]);
        if (!rows || rows.length === 0) {
            return res.status(400).json({ message: "Candidate not joined" });
        }
        const candidate = rows[0];

        const joined = new Date(candidate.joined_date);
        const clawback_end = new Date(joined);
        clawback_end.setDate(clawback_end.getDate() + candidate.clawback_duration);

        const invoice_start = new Date(clawback_end);
        invoice_start.setDate(invoice_start.getDate() + 1);

        const invoice_end = new Date(invoice_start);
        invoice_end.setDate(invoice_end.getDate() + candidate.invoice_clear_time);

        // const baseAmount =
        //     candidate.show_payout === "actual"
        //         ? candidate.real_payout_amount
        //         : candidate.payout_amount;

        const calculated_amount =
            (candidate.real_payout_amount * (candidate.percentage || 0)) / 100;

        await connection.query( `UPDATE payouts SET calculated_amount = ?, clawback_start = ?, clawback_end = ?, invoice_start = ?, 
                    invoice_end = ?, status = 'clawback', updated_at = NOW() WHERE candidate_id = ?`,
                    [calculated_amount, joined, clawback_end, invoice_start, invoice_end, candidate_id]);

        await updateCandidateAssignmentStatus(connection, candidate_id, "clawback");
        
        await connection.query(
            `
            INSERT INTO candidate_status_history
            (candidate_id, employee_id, old_status, new_status)
            VALUES (?, ?, 'joined', 'clawback')
        `,
            [candidate_id, candidate.employee_id]
        );

        await connection.commit();
        res.json({ message: "Clawback started successfully" });

    } catch (err) {
        await connection.rollback();
        console.error(err);
        res.status(500).json({ message: "Error starting clawback" });
    } finally {
        connection.release();
    }
};

export const markInvoiceClear = async (req, res) => {
    let connection;
    try {
        connection = await db.promise().getConnection();
        await connection.beginTransaction();

        const { candidate_id } = req.body;

        const [[payout]] = await connection.query(
            "SELECT employee_id, status FROM payouts WHERE candidate_id = ?",
            [candidate_id]
        );

        if (!payout) {
            return res.status(400).json({ message: "Payout not found" });
        }
        if (payout.status !== 'clawback') {
            return res.status(400).json({ message: "Invalid payout state" });
        }

        await connection.query(
            "UPDATE payouts SET status='invoice_clear' WHERE candidate_id=?",
            [candidate_id]
        );

        await updateCandidateAssignmentStatus(connection, candidate_id, "invoice_clear");

        await connection.query(`INSERT INTO candidate_status_history
            (candidate_id, employee_id, old_status, new_status, change_reason, changed_at)
            VALUES (?, ?, 'clawback', 'invoice_clear', 'Invoice cleared', CURRENT_TIMESTAMP)`,
            [candidate_id, payout.employee_id]
        );
        await connection.commit();

        res.json({ message: "Invoice marked clear" });

    } catch (err) {
        await connection.rollback();
        res.status(500).json({ message: "Error marking invoice clear" });
    }
    finally {
        connection.release();
    }
};

export const markApproved = async (req, res) => {
    let connection;
    try {
        connection = await db.promise().getConnection();
        await connection.beginTransaction();
        const { admin_id, candidate_id } = req.body;

        const [[payout]] = await connection.query(
            "SELECT employee_id, status FROM payouts WHERE candidate_id=?",
            [candidate_id]
        );

        if (!payout || payout.status !== "invoice_clear") {
            return res.status(400).json({ message: "Invalid payout state" });
        }

        await connection.query(
            `
            UPDATE payouts
            SET status='approved', approved_at=NOW(), approved_by=? 
            WHERE candidate_id=?
        `,
            [admin_id, candidate_id]
        );

        await updateCandidateAssignmentStatus(connection, candidate_id, "approved");

        await connection.query(
            `
            INSERT INTO candidate_status_history
            (candidate_id, employee_id, old_status, new_status, change_reason, changed_at)
            VALUES (?, ?, 'invoice_clear', 'approved', 'Approved by admin', CURRENT_TIMESTAMP)
        `,
            [candidate_id, payout.employee_id]
        );

        await connection.commit();
        res.json({ message: "Payout approved" });

    } catch (err) {
        await connection.rollback();
        console.error(err);
        res.status(500).json({ message: "Approval failed" });
    } finally {
        connection.release();
    }
};

export const markCompletelyJoined = async (req, res) => {
    let connection;
    try {
        connection = await db.promise().getConnection();
        await connection.beginTransaction();
        const { candidate_id } = req.body;

        const [[payout]] = await connection.query(
            "SELECT employee_id, status FROM payouts WHERE candidate_id=?",
            [candidate_id]
        );
        if (!payout || payout.status !== "approved") {
            return res.status(400).json({ message: "Invalid payout state" });
        }

        await connection.query(
            "UPDATE payouts SET status='completely_joined' WHERE candidate_id=?",
            [candidate_id]
        );

        await updateCandidateAssignmentStatus(connection, candidate_id, "completely_joined");

        await connection.query(
            `
            INSERT INTO candidate_status_history
            (candidate_id, employee_id, old_status, new_status, change_reason)
            VALUES (?, ?, 'approved', 'completely_joined', 'Fully joined')
        `,
            [candidate_id, payout.employee_id]
        );

        await connection.commit();
        res.json({ message: "Candidate marked completely joined" });

    } catch (err) {
        await connection.rollback();
        console.error(err);
        res.status(500).json({ message: "Error" });
    } finally {
        connection.release();
    }
};

export const markDropout = async (req, res) => {
    const { candidate_id, reason } = req.body;

    if (!reason) {
        return res.status(400).json({ message: "Reason required" });
    }
    const conn = await db.promise().getConnection();
    try {
        await conn.beginTransaction();

        const [assignment] = await conn.query(
            `SELECT csh.employee_id
            FROM candidate_status_history csh
            WHERE csh.candidate_id = ?
              AND csh.new_status = 'joined'
            ORDER BY csh.changed_at DESC
            LIMIT 1`,
            [candidate_id]
        );

        if (!assignment || assignment.length === 0) {
            await conn.rollback();
            return res.status(400).json({ message: "Candidate is not in 'joined' status" });
        }
        const employee_id = assignment[0].employee_id;

        await conn.query(
            `UPDATE candidate_assignments
            SET assignment_status = 'dropout'
            WHERE candidate_id = ?`,
            [candidate_id]
        );

        await conn.query(
            `INSERT INTO candidate_status_history
            (candidate_id, employee_id, old_status, new_status, change_reason)
            VALUES (?, ?, 'joined', 'dropout', ?)`,
            [candidate_id, employee_id, reason]
        );
        
        await conn.query(
            `UPDATE payouts
            SET status = 'dropout'
            WHERE candidate_id = ? AND status != 'completely_joined'`,
            [candidate_id]
        );

        await conn.commit();
        res.json({ message: "Candidate marked as dropout successfully" });

    } catch (err) {
        await conn.rollback();
        console.error(err);
        res.status(500).json({ message: "An error occurred while marking dropout" });
    } finally {
        conn.release();
    }
};

export const batchApprove = async (req, res) => {
    let connection;
    try {
        connection = await db.promise().getConnection();
        await connection.beginTransaction();
        const { candidateIds, adminId } = req.body; 

        if (candidateIds.length === 0) {
            return res.status(400).json({ message: "No valid candidate IDs" });
        }

        // Check for any invalid payouts
        const [payouts] = await connection.query(
            `SELECT candidate_id, employee_id, status FROM payouts WHERE candidate_id IN (?)`,
            [candidateIds]
        );

        const invalidPayouts = payouts.filter(payout => payout.status !== "invoice_clear");

        if (invalidPayouts.length > 0) {
            return res.status(400).json({ message: "One or more payouts have invalid state" });
        }

        if (!Array.isArray(candidateIds) || candidateIds.length === 0) {
            return res.status(400).json({ message: "No candidate IDs provided" });
        }

        for (let candidate_id of candidateIds) {
            await connection.query(
                `
                UPDATE payouts
                SET status='approved', approved_at=NOW(), approved_by=? 
                WHERE candidate_id=?
            `,
                [adminId, candidate_id]
            );

            await updateCandidateAssignmentStatus(connection, candidate_id, "approved");

            // Log the status change in history
            await connection.query(
                `
                INSERT INTO candidate_status_history
                (candidate_id, employee_id, old_status, new_status, change_reason, changed_at)
                VALUES (?, ?, 'invoice_clear', 'approved', 'Approved by admin', CURRENT_TIMESTAMP)
            `,
                [candidate_id, payouts.find(p => p.candidate_id === candidate_id).employee_id]
            );
        }

        await connection.commit();

        res.json({ message: `${candidateIds.length} payout(s) approved` });

    } catch (err) {
        await connection.rollback();
        console.error(err);
        res.status(500).json({ message: "Batch approval failed" });
    }
    finally {
        connection.release();
    }
};

export const rejectPayout = async (req, res) => {
    let connection;
    try {
        connection = await db.promise().getConnection();
        await connection.beginTransaction();
        const { candidate_id, reason } = req.body;
        const adminId = req.query.adminId;

        if (!reason) return res.status(400).json({ message: "Reason required" });

        const [payout] = await connection.query(
            `SELECT employee_id FROM payouts WHERE candidate_id = ?`,
            [candidate_id]
        );
        if (!payout.length) return res.status(400).json({ message: "Payout not found" });

        await connection.query(`
            UPDATE payouts
            SET status='rejected', notes=?, approved_by=?
            WHERE candidate_id=?
        `, [reason, adminId, candidate_id]);

        await updateCandidateAssignmentStatus(connection, candidate_id, "rejected");

        const [statusRows] = await connection.query(
            `SELECT new_status FROM candidate_status_history WHERE candidate_id = ? ORDER BY changed_at DESC LIMIT 1`, [candidate_id]);
        const old_status = statusRows.length ? statusRows[0].new_status : null;
        await connection.query(`
            INSERT INTO candidate_status_history (candidate_id, employee_id, old_status, new_status, change_reason)
            VALUES (?, ?, ?, 'rejected', ?)
        `, [candidate_id, payout[0].employee_id, old_status, reason]);

        await connection.commit();
        return res.json({ message: "Payout rejected" });
    } catch (err) {
        await connection.rollback();
        return res.status(500).json({ message: err.message });
    } finally {
        connection.release();
    }
};

export const exportCSV = async (req, res) => {
  let connection;
  try {
    connection = await db.promise().getConnection();

    const query = `
      SELECT 
          c.id AS candidate_id,
          c.name AS candidate_name,
          c.email AS candidate_email,
          pr.process_name,
          e.full_name AS employee_name,
          pr.payout_type,
          pay.employee_percentage,
          pay.calculated_amount,
          pay.joined_date,
          pay.clawback_start,
          pay.clawback_end,
          pay.invoice_start,
          pay.invoice_end,
          pay.status,
          pay.generated_at,
          pay.approved_at,
          pay.approved_by,
          pay.clawback_reason
      FROM candidate_status_history csh
      INNER JOIN candidates c ON csh.candidate_id = c.id
      INNER JOIN candidate_assignments ca ON c.id = ca.candidate_id
      INNER JOIN processes pr ON ca.process_id = pr.id
      INNER JOIN employees e ON csh.employee_id = e.employee_id
      LEFT JOIN payouts pay ON c.id = pay.candidate_id
      WHERE csh.new_status = 'joined'
        AND csh.id = (
          SELECT MAX(id) 
          FROM candidate_status_history csh2 
          WHERE csh2.candidate_id = csh.candidate_id 
          AND csh2.new_status = 'joined'
        )
      ORDER BY csh.changed_at DESC
    `;

    const [rows] = await connection.query(query);

    // Convert rows to CSV
    const csvRows = [];

    // Add header
    csvRows.push([
      "Candidate ID",
      "Candidate Name",
      "Email",
      "Process Name",
      "Employee Name",
      "Payout Type",
      "Employee Percentage",
      "Calculated Amount",
      "Joined Date",
      "Clawback Start",
      "Clawback End",
      "Invoice Start",
      "Invoice End",
      "Status",
      "Generated At",
      "Approved At",
      "Approved By",
      "Clawback Reason",
    ]);

    // Add data rows
    rows.forEach((row) => {
      csvRows.push([
        row.candidate_id,
        row.candidate_name,
        row.candidate_email,
        row.process_name,
        row.employee_name,
        row.payout_type,
        row.employee_percentage,
        row.calculated_amount,
        row.joined_date ? format(new Date(row.joined_date), "yyyy-MM-dd") : "",
        row.clawback_start ? format(new Date(row.clawback_start), "yyyy-MM-dd") : "",
        row.clawback_end ? format(new Date(row.clawback_end), "yyyy-MM-dd") : "",
        row.invoice_start ? format(new Date(row.invoice_start), "yyyy-MM-dd") : "",
        row.invoice_end ? format(new Date(row.invoice_end), "yyyy-MM-dd") : "",
        row.status,
        row.generated_at ? format(new Date(row.generated_at), "yyyy-MM-dd") : "",
        row.approved_at ? format(new Date(row.approved_at), "yyyy-MM-dd") : "",
        row.approved_by,
        row.clawback_reason,
      ]);
    });

    // Convert array of arrays to CSV string
    const csvString = csvRows.map((r) => r.map((v) => `"${v ?? ""}"`).join(",")).join("\n");

    // Send CSV as download
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
    "Content-Disposition",
    `attachment; filename="payout_report_${format(new Date(), "yyyy-MM-dd")}.csv"`
    );
    res.setHeader(
    "Access-Control-Expose-Headers",
    "Content-Disposition"
    );

    res.send(csvString);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to export CSV" });
  } finally {
    if (connection) connection.release();
  }
};

// export const emergencyClawback = async (req, res) => {
//     let connection;
//     try {
//         connection = await db.promise().getConnection();
//         await connection.beginTransaction();
//         const { candidate_id, reason } = req.body;

//         const [payout] = await connection.query(
//             "SELECT employee_id, status FROM payouts WHERE candidate_id=?",
//             [candidate_id]
//         );

//         if (!payout || !["invoice_clear", "approved"].includes(payout.status)) {
//             return res.status(400).json({ message: "Not allowed" });
//         }

//         await connection.query(
//             `
//             UPDATE payouts
//             SET status='clawback', clawback_reason=?
//             WHERE candidate_id=?
//         `,
//             [reason, candidate_id]
//         );

//         await updateCandidateAssignmentStatus(connection, candidate_id, "clawback");

//         await connection.query(
//             `
//             INSERT INTO candidate_status_history
//             (candidate_id, employee_id, old_status, new_status, change_reason)
//             VALUES (?, ?, ?, 'clawback', ?)
//         `,
//             [candidate_id, payout.employee_id, payout.status, reason]
//         );

//         await connection.commit();
//         res.json({ message: "Emergency clawback applied" });

//     } catch (err) {
//         await connection.rollback();
//         res.status(500).json({ message: "Error" });
//     } finally {
//         connection.release();
//     }
// };

// export const markClawback = async (req, res) => {
//     let connection;
//     try {
//         connection = await db.promise().getConnection();
//         await connection.beginTransaction();
//         const { candidate_id, reason } = req.body;
//         if (!reason) return res.status(400).json({ message: "Reason required" });

//         const [payout] = await connection.query(
//             `SELECT employee_id, clawback_end FROM payouts WHERE candidate_id = ?`,
//             [candidate_id]
//         );
//         if (!payout.length) return res.status(400).json({ message: "Payout not found" });

//         if (new Date() > new Date(payout[0].clawback_end)) {
//             return res.status(400).json({ message: "Clawback window expired" });
//         }

//         await connection.query(`
//             UPDATE payouts
//             SET status='clawback', clawback_reason=?, updated_at=CURRENT_TIMESTAMP
//             WHERE candidate_id=?
//         `, [reason, candidate_id]);

//         await updateCandidateAssignmentStatus(connection, candidate_id, "clawback");

//         await connection.query(`
//             INSERT INTO candidate_status_history
//             VALUES (NULL, ?, ?, 'payout_pending', 'clawback', ?, CURRENT_TIMESTAMP)
//         `, [candidate_id, payout[0].employee_id, `Clawback: ${reason}`]);

//         await connection.commit();
//         res.json({ message: "Clawback marked successfully" });
//     } catch (err) {
//         connection.release();
//         res.status(500).json({ message: err.message });
//     } finally {
//         if (connection) connection.release();
//     }
// };

// export const approvePayout = async (req, res) => {
//     let connection;
//     try {
//         connection = await db.promise().getConnection();
//         await connection.beginTransaction();
//         const { candidate_id } = req.body;
//         const adminId = req.query.adminId;

//         const [payout] = await connection.query(
//             `SELECT employee_id, invoice_end FROM payouts WHERE candidate_id = ?`,
//             [candidate_id]
//         );
//         if (!payout.length) return res.status(400).json({ message: "Payout not found" });

//         if (new Date() <= new Date(payout[0].invoice_end)) {
//             return res.status(400).json({ message: "Invoice period not completed" });
//         }

//         await connection.query(`
//             UPDATE payouts
//             SET status='approved', approved_at=CURRENT_TIMESTAMP, approved_by=?
//             WHERE candidate_id=?
//         `, [adminId, candidate_id]);

//         await updateCandidateAssignmentStatus(connection, candidate_id, "approved");

//         await connection.query(`
//             INSERT INTO candidate_status_history
//             VALUES (NULL, ?, ?, 'payout_pending', 'approved', 'Approved by admin', CURRENT_TIMESTAMP)
//         `, [candidate_id, payout[0].employee_id]);

//         await connection.commit();
//         res.json({ message: "Payout approved" });
//     } catch (err) {
//         await connection.rollback();
//         res.status(500).json({ message: err.message });
//     } finally {
//         connection.release();
//     }
// };