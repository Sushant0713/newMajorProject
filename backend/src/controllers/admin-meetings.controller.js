import { executeQuery } from "../lib/executeQuery.js";

// Helper function to convert ISO date to India timezone and format for MySQL
const convertToIndiaDateTime = (isoDateString) => {
    try {
        // Parse the ISO date string (it's in UTC)
        const utcDate = new Date(isoDateString);
        
        // Get date components in India timezone (IST - UTC+5:30)
        const options = {
            timeZone: 'Asia/Kolkata',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        };
        
        const indiaDateStr = utcDate.toLocaleString('en-IN', options);
        // Format: "27/12/2025, 17:14:00" -> "2025-12-27 17:14:00"
        const [datePart, timePart] = indiaDateStr.split(', ');
        const [day, month, year] = datePart.split('/');
        
        return `${year}-${month}-${day} ${timePart}`;
    } catch (error) {
        console.error("Error converting date:", error);
        throw new Error("Invalid date format");
    }
};

// Add a new meeting
export const addNewMeeting = async(req, res) => {
    try {
        const {meetingName, googleMeetLink, members, description, meetingDate, durationMinutes, adminName} = req.body;
        // Check if meeting name and meeting link exist
        if (!meetingName || !googleMeetLink) {
            return res.status(400).json({message: "Meeting name and Google Meet link are required"});
        }
        
        if (!meetingDate) {
            return res.status(400).json({message: "Meeting date is required"});
        }
        
        const membersArray = members.split(',').map(m => m.trim());
        const membersJson = JSON.stringify(membersArray);
        
        // Convert date to India timezone format
        const indiaDateTime = convertToIndiaDateTime(meetingDate);

        var query = `INSERT INTO meetings (meeting_name, google_meet_link, members, description, meeting_date, duration_minutes, created_by)
           VALUES (?, ?, ?, ?, ?, ?, ?)`;
        const addMeetingResult = await executeQuery(query, [meetingName, googleMeetLink, membersJson, description, indiaDateTime, durationMinutes, adminName]);
        if (addMeetingResult.affectedRows === 0) {
            return res.status(200).json({message: "Failed to add new meeting"});
        }

        return res.status(200).json({message: "New meeting added successfully"});
    } catch (error) {
        console.error("Error while adding new meeting:" ,error);
        return res.status(400).json({message: error.message || "Failed to add meeting"});
    }
}

// Update an existing meeting
export const updateMeeting = async(req, res) => {
    try {
        const meetingId = req.query.meetingId;
        if (!meetingId){
            return res.status(400).json({message: "Meeting ID is required"});
        }

        const {meetingName, googleMeetLink, members, description, meetingDate, durationMinutes, status} = req.body;
        if (!meetingName || !googleMeetLink) {
            return res.status(400).json({message: "Meeting name and Google Meet link are required"});
        }
        
        if (!meetingDate) {
            return res.status(400).json({message: "Meeting date is required"});
        }

        // transform members string to json array
        const membersArray = members.split(',').map(m => m.trim());
        const membersJson = JSON.stringify(membersArray);
        
        // Convert date to India timezone format
        const indiaDateTime = convertToIndiaDateTime(meetingDate);

        var query = `UPDATE meetings SET meeting_name = ?, google_meet_link = ?, members = ?, description = ?, meeting_date = ?, duration_minutes = ?, status = ? WHERE id = ?`;
        const updateMeetingResult = await executeQuery(query, [meetingName, googleMeetLink, membersJson, description, indiaDateTime, durationMinutes, status, meetingId]);
        if (updateMeetingResult.affectedRows === 0) {
            return res.status(200).json({message: "Failed to update meeting"});
        }

        return res.status(200).json({message: "Meeting updated successfully"});
    } catch (error) {
        console.error("Error while updating meeting:" ,error);
        return res.status(400).json({message: error.message || "Failed to update meeting"});
    }
}

// Delete a meeting
export const deleteMeeting = async(req, res) => {
    try {
        const meetingId = req.query.meetingId;
        if (!meetingId){
            return res.status(400).json({message: "Meeting ID is required"});
        }

        var query = `DELETE FROM meetings WHERE id = ?`;
        const deleteMeetingResult = await executeQuery(query, [meetingId]);
        if (deleteMeetingResult.affectedRows === 0) {
            return res.status(200).json({message: "Failed to delete meeting"});
        }
        return res.status(200).json({message: "Meeting deleted successfully"});
    } catch (error) {
        console.error("Error while deleting meeting:" ,error);
        return res.status(400).json(error);
    }
}

// Get all meetings
export const getAllMeetings = async(req, res) => {
    try {
        var query = `SELECT * FROM meetings ORDER BY meeting_date DESC`;
        const meetings = await executeQuery(query);
        return res.status(200).json(meetings);
    } catch (error) {
        console.error("Error while fetching all meetings:" ,error);
        return res.status(400).json(error);
    }
}

// Get specific meeting by ID
export const getMeetingById = async(req, res) => {
    try {
        const meetingId = req.query.meetingId;
        if (!meetingId){
            return res.status(400).json({message: "Meeting ID is required"});
        }

        var query = `SELECT * FROM meetings WHERE id = ?`;
        const meeting = await executeQuery(query, [meetingId]);
        return res.status(200).json(meeting);
    } catch (error) {
        console.error("Error while fetching meeting:" ,error);
        return res.status(400).json(error);
    }
}

export const getMembers = async(req, res) => {
    try {
        let query = `SELECT employee_id, full_name FROM employees WHERE designation != 'admin' ORDER BY employee_id ASC`;
        const members = await executeQuery(query);
        if( members.length === 0){
            return res.status(404).json({message: "No members found"});
        }
        res.status(200).json(members);
    } catch (error) {
        console.error("Error while fetching members:" ,error);
        return res.status(400).json(error);
    }
}

// Get employee names by employee IDs
export const getEmployeeNamesByIds = async(req, res) => {
    try {
        const employeeIds = req.query.employeeIds;
        
        if (!employeeIds) {
            return res.status(400).json({message: "Employee IDs are required"});
        }

        // Split comma-separated employee IDs and trim whitespace
        const idsArray = employeeIds.split(',').map(id => id.trim()).filter(id => id);
        
        if (idsArray.length === 0) {
            return res.status(400).json({message: "At least one employee ID is required"});
        }

        // Create placeholders for SQL IN clause
        const placeholders = idsArray.map(() => '?').join(',');
        
        let query = `SELECT employee_id, full_name FROM employees WHERE employee_id IN (${placeholders})`;
        const employees = await executeQuery(query, idsArray);
        
        if (employees.length === 0) {
            return res.status(404).json({message: "No employees found with the provided IDs"});
        }

        // Return as object with employee_id as key for easy lookup
        const employeeMap = {};
        employees.forEach(emp => {
            employeeMap[emp.employee_id] = emp.full_name;
        });

        res.status(200).json(employeeMap);
    } catch (error) {
        console.error("Error while fetching employee names by IDs:" ,error);
        return res.status(400).json({message: error.message || "Failed to fetch employee names"});
    }
}