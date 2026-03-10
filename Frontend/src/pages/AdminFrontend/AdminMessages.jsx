import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./AdminMessages.css";
import logo from "../../assets/OHS.jpg";

const contactsData = [
  {
    id: 1,
    name: "Aditya Vinod Kedari",
    initials: "AV",
    role: "Team Leader",
    lastMessage: "Meeting scheduled for tomorrow",
    time: "Jul 10",
    unread: 0,
    color: "indigo",
    online: true,
  },
  {
    id: 2,
    name: "Rohit Sharma",
    initials: "RS",
    role: "Admin",
    lastMessage: "Please review the JD",
    time: "2:45 PM",
    unread: 2,
    color: "green",
    online: true,
  },
  {
    id: 3,
    name: "Priya Gupta",
    initials: "PG",
    role: "Employee",
    lastMessage: "Thanks — will update today",
    time: "Yesterday",
    unread: 0,
    color: "pink",
    online: false,
  },
  {
    id: 4,
    name: "Vikram Singh",
    initials: "VS",
    role: "Employee",
    lastMessage: "Got it, thanks!",
    time: "Jul 8",
    unread: 0,
    color: "blue",
    online: false,
  },
];

const initialMessages = [
  {
    id: 1,
    text: "Hi Aditya, can you share the process doc?",
    time: "2:40 PM",
    sent: false,
  },
  {
    id: 2,
    text: "Sure — I will send it shortly.",
    time: "2:41 PM",
    sent: true,
    read: true,
  },
];

const navItems = [
  { icon: "dashboard", label: "Dashboard", path: "/admin-dashboard" },
  { icon: "group", label: "Clients", path: "/admin-clients",hasSubmenu: true },
  { icon: "work", label: "Process", path: "/admin-process" },
  { icon: "badge", label: "Employees", path: "/admin-employees" },
  { icon: "groups", label: "Teams", path: "/admin-teams" },
  { icon: "person_search", label: "Tracker", path: "/admin-joining-tracker", hasSubmenu: true },
  { icon: "upload_file", label: "Data Import", path: "/admin-data-import" },
  { icon: "videocam", label: "Meetings", path: "/admin-meetings" },
  { icon: "mail", label: "Messages", path: "/admin-messages" },
  { icon: "paid", label: "Payout Management", path: "/admin-payout-management" },
  { icon: "event_busy", label: "LOP Management", path: "/admin-lop-management" },
];

export default function AdminMessages() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedContact, setSelectedContact] = useState(contactsData[0]);
  const [messages, setMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupDesc, setGroupDesc] = useState("");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const messagesEndRef = useRef(null);

  const handleLogout = () => {
    navigate("/");
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    const msg = {
      id: messages.length + 1,
      text: newMessage,
      time: "Now",
      sent: true,
      read: false,
    };
    setMessages([...messages, msg]);
    setNewMessage("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCreateGroup = () => {
    alert(`Group "${groupName}" created (demo)`);
    setShowGroupModal(false);
    setGroupName("");
    setGroupDesc("");
  };

  const handleSendBroadcast = () => {
    alert("Broadcast sent (demo)");
    setShowBroadcastModal(false);
    setBroadcastMessage("");
  };

  const filteredContacts = contactsData.filter((contact) => {
    const matchesSearch = contact.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === "All" || contact.role === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const getAvatarColor = (color) => {
    const colors = {
      indigo: { bg: "#e0e7ff", text: "#4338ca" },
      green: { bg: "#dcfce7", text: "#166534" },
      pink: { bg: "#fce7f3", text: "#be185d" },
      blue: { bg: "#dbeafe", text: "#1e40af" },
    };
    return colors[color] || colors.indigo;
  };

  return (
    <div className="admin-messages-root">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <img src={logo} alt="Logo" className="admin-logo-img" />
          <div>
            <h2 className="admin-brand-name">Owh HR</h2>
            <p className="admin-brand-subtitle">Internal Chat</p>
          </div>
        </div>

        <nav className="admin-nav">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              className={`admin-nav-item ${location.pathname === item.path ? "active" : ""}`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <button onClick={handleLogout} className="admin-nav-item logout-btn">
            <span className="material-symbols-outlined">logout</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Chat Container */}
      <div className="chat-container">
        {/* Left Panel: Contacts List */}
        <div className="contacts-panel">
          <div className="contacts-header">
            <div className="contacts-header-top">
              <h2 className="contacts-title">Messages</h2>
              <div className="contacts-actions">
                <button
                  className="btn-broadcast"
                  onClick={() => setShowBroadcastModal(true)}
                >
                  Broadcast
                </button>
                <button
                  className="btn-new-group"
                  onClick={() => setShowGroupModal(true)}
                >
                  New Group
                </button>
              </div>
            </div>

            <div className="search-container">
              <input
                type="text"
                placeholder="Search employees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <span className="material-symbols-outlined search-icon">search</span>
            </div>

            <div className="filter-tabs">
              {["All", "Admin", "Team Leader", "Employee"].map((filter) => (
                <button
                  key={filter}
                  className={`filter-tab ${activeFilter === filter ? "active" : ""}`}
                  onClick={() => setActiveFilter(filter)}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="contacts-list">
            {filteredContacts.map((contact) => (
              <div
                key={contact.id}
                className={`contact-item ${selectedContact.id === contact.id ? "active" : ""}`}
                onClick={() => setSelectedContact(contact)}
              >
                <div
                  className="contact-avatar"
                  style={{
                    backgroundColor: getAvatarColor(contact.color).bg,
                    color: getAvatarColor(contact.color).text,
                  }}
                >
                  {contact.initials}
                </div>
                <div className="contact-info">
                  <div className="contact-header">
                    <div>
                      <p className="contact-name">{contact.name}</p>
                      <p className="contact-role">{contact.role}</p>
                    </div>
                    <span className="contact-time">{contact.time}</span>
                  </div>
                  <div className="contact-preview">
                    {contact.unread > 0 && (
                      <span className="unread-badge">{contact.unread}</span>
                    )}
                    <span className="preview-text">{contact.lastMessage}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel: Chat Window */}
        <div className="chat-panel">
          {/* Chat Header */}
          <div className="chat-header">
            <div className="chat-user-info">
              <div
                className="chat-avatar"
                style={{
                  backgroundColor: getAvatarColor(selectedContact.color).bg,
                  color: getAvatarColor(selectedContact.color).text,
                }}
              >
                {selectedContact.initials}
              </div>
              <div>
                <p className="chat-user-name">
                  {selectedContact.name}
                  <span className="chat-user-role"> — {selectedContact.role}</span>
                </p>
                <p className="chat-status">
                  {selectedContact.online ? "Online" : "Offline"}
                </p>
              </div>
            </div>
            <div className="chat-actions">
              <button className="chat-action-btn">
                <span className="material-symbols-outlined">call</span>
              </button>
              <button className="chat-action-btn">
                <span className="material-symbols-outlined">videocam</span>
              </button>
              <button className="chat-action-btn">
                <span className="material-symbols-outlined">attach_file</span>
              </button>
              <button className="chat-action-btn">
                <span className="material-symbols-outlined">more_vert</span>
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="messages-area">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`message-bubble ${msg.sent ? "sent" : "received"}`}
              >
                <p className="message-text">{msg.text}</p>
                <div className="message-meta">
                  <span>{msg.time}</span>
                  {msg.sent && (
                    <span className="read-status">{msg.read ? "✔✔" : "✔"}</span>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="message-input-area">
            <button className="input-action-btn">
              <span className="material-symbols-outlined">emoji_emotions</span>
            </button>
            <input
              type="text"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="message-input"
            />
            <button className="input-action-btn">
              <span className="material-symbols-outlined">attach_file</span>
            </button>
            <button className="send-btn" onClick={handleSendMessage}>
              Send
            </button>
          </div>
        </div>
      </div>

      {/* New Group Modal */}
      {showGroupModal && (
        <div className="modal-overlay" onClick={() => setShowGroupModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Create New Group</h3>
              <button className="modal-close" onClick={() => setShowGroupModal(false)}>
                &times;
              </button>
            </div>
            <div className="modal-body">
              <input
                type="text"
                placeholder="Group name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="modal-input"
              />
              <textarea
                placeholder="Group description"
                value={groupDesc}
                onChange={(e) => setGroupDesc(e.target.value)}
                className="modal-textarea"
              />
              <select multiple className="modal-select">
                <option>Aditya Vinod Kedari</option>
                <option>Rohit Sharma</option>
                <option>Priya Gupta</option>
                <option>Vikram</option>
              </select>
              <div className="modal-actions">
                <button className="btn-cancel" onClick={() => setShowGroupModal(false)}>
                  Cancel
                </button>
                <button className="btn-submit" onClick={handleCreateGroup}>
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Broadcast Modal */}
      {showBroadcastModal && (
        <div className="modal-overlay" onClick={() => setShowBroadcastModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Create Broadcast</h3>
              <button className="modal-close" onClick={() => setShowBroadcastModal(false)}>
                &times;
              </button>
            </div>
            <div className="modal-body">
              <select multiple className="modal-select">
                <option>All team members</option>
                <option>Rohit Sharma</option>
                <option>Priya Gupta</option>
                <option>Vikram</option>
              </select>
              <textarea
                placeholder="Message to broadcast"
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                className="modal-textarea"
              />
              <div className="modal-actions">
                <button className="btn-cancel" onClick={() => setShowBroadcastModal(false)}>
                  Cancel
                </button>
                <button className="btn-broadcast-send" onClick={handleSendBroadcast}>
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

