import { executeQuery } from "../db/executeQuery.js";

const STATUS_MAP = {
    pending: "joined",
    clawback: "clawback",
    invoice_clear: "invoice",
    approved: "invoice",
    completely_joined: "completely_joined",
    rejected: "joined"
};

export const updateAssignmentStatus = async (candidateId, payoutStatus) => {
    const status = STATUS_MAP[payoutStatus] || "joined";

    const query = `
        UPDATE candidate_assignments
        SET assignment_status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE candidate_id = ?
    `;
    await executeQuery(query, [status, candidateId]);
};