📚 Physics Cube Academy – New Addmission Dashboard
A modern, secure, and lightning-fast web application built to manage Physics Cube Academy’s new student admissions, records, and analytics — all in one stylish, responsive dashboard.
The system is powered by Google Sheets as a backend using Google Apps Script, ensuring real-time synchronization, reliability, and easy data management.

✨ Features
🔐 Secure Login System
Admin authentication using username & password

Local storage keeps admins logged in for 24 hours

🏙 District Management
Add new districts

Delete existing districts

Automatically updates registration form dropdowns

👥 Batch Management
Create new batches (e.g., 2026 Proper, 2027 Repeat)

Delete old batches

Fully synced with all forms & reports

📝 Student Registration
Auto-generate unique Registration IDs for each batch

Register with name, district, batch, and join date

Real-time updates to stats and last registration IDs

🔍 Student Lookup
Search by Registration ID

Edit student details

Delete student records instantly

📅 Date-Wise Reports
Select a date to view all students who joined that day

Displayed in a clean, sortable table with quick actions

📈 Count Reports
Select a date range and optional batch

See registrations by admin, by batch, and total counts

📊 Daily Analytics
Interactive Chart.js visualizations of daily registrations

Filter by date range

Smooth, modern animations for data presentation

🖥 Technology Stack
Frontend: HTML5, CSS3 (Apple-inspired design), Vanilla JavaScript

Backend: Google Apps Script

Database: Google Sheets (real-time sync)

Charts & Analytics: Chart.js

UI Design: Responsive, gradient-rich, mobile-friendly

📂 Project Structure
bash
Copy
Edit
├── physics-cube-academy-dashboard.html   # Frontend UI
├── app.js                                # Google Apps Script backend
└── README.md                             # Project documentation
⚙️ How It Works
Login – Admin signs in using their credentials.

Dashboard Load – Fetches live data (districts, batches, students, stats) from Google Sheets.

Actions – Admin can add, edit, delete records instantly, and all changes reflect in real-time.

Reports & Analytics – Generate reports, view analytics charts, and export results.

🚀 Getting Started
1️⃣ Clone the Repository
bash
Copy
Edit
git clone https://github.com/thuvarahan-t/PCANewAddmission.git
2️⃣ Deploy Backend (Google Apps Script)
Copy app.js into a new Google Apps Script project.

Link it to your Google Sheet.

Deploy as a web app with Anyone with the link access.

3️⃣ Update API URL
Replace API_URL in physics-cube-academy-dashboard.html with your deployed script URL.

4️⃣ Open Dashboard
Run physics-cube-academy-dashboard.html in your browser.

👥 Multi-admin role management

🔔 Notification system for new registrations

🏆 Credits
Developed by Thuvarahan for Physics Cube Academy.
Designed for speed, accuracy, and modern UI experience.

