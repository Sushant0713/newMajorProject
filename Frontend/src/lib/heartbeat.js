import {axiosInstance} from "./axios";

let heartbeatInterval = null;

export const startHeartbeat = () => {
    debugger;
    if (heartbeatInterval) return; // already running

    heartbeatInterval = setInterval(async () => {
        console.log("heartbeat interval is set");
        try {
            const sessionId = sessionStorage.getItem("sessionId");
            console.log("sessionId: ", sessionId);

            //Skip heartbeat if sessionId not available
            if (!sessionId) {
                console.warn("Heartbeat skipped: no sessionId found");
                return;
            }

            await axiosInstance.post("/auth/heartbeat", { sessionId });
        } catch (error) {
            console.error("Heartbeat failed:", error);
        }
    }, 300000); // every 5 minutes
};

export const stopHeartbeat = () => {
    if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
        heartbeatInterval = null;
    }
};

export const registerTabCloseHandler = () => {
    window.addEventListener("beforeunload", () => {
        const sessionId = sessionStorage.getItem("sessionId");
        if (!sessionId) return;

        // sendBeacon sends as plain text; backend must parse accordingly
        const payload = JSON.stringify({ sessionId });
        navigator.sendBeacon("/api/auth/logout-beacon", payload);
    });
};