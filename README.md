SmartSeva – Crowdsourced Civic Issue Reporting & Resolution System

"SmartSeva" is a web-based civic issue reporting and management platform designed to bridge the communication gap between citizens and local authorities. It enables citizens to report public infrastructure and sanitation-related problems while providing administrators and category-specific contractors with a centralized system to manage, assign, track, and resolve complaints.

The platform aims to make civic issue management more organized, transparent, and efficient through digital complaint registration, location-based monitoring, and structured task assignment.

🚀 Key Features

👤 Citizen Module : 

- Submit civic complaints with subject, description, category, mobile number, and location.
- Upload supporting images or videos as complaint evidence.
- Receive a unique complaint tracking ID.
- Track complaint progress and status updates.
- View the latest information about submitted complaints.

🛠️ Admin Dashboard : 

- Centralized dashboard to view and manage citizen complaints.
- View complaint details, uploaded media, categories, and locations.
- Filter complaints based on different civic issue categories.
- Monitor reported issues through an interactive map using Leaflet.
- Assign complaints to the appropriate category-specific contractors.
- Update complaint statuses and monitor resolution progress.

👷 Contractor Module : 

- Separate login and dashboards for different contractor categories.
- View complaints assigned by the administrator.
- Access complaint details and supporting media.
- Update the progress and status of assigned complaints.
- Upload completion proof to support resolution verification.

🔄 Complaint Management Workflow :

1. A citizen submits a complaint with relevant details and supporting media.
2. The system generates a unique complaint ID.
3. The complaint becomes available in the Admin Dashboard.
4. The administrator reviews the complaint and assigns it to the appropriate category-specific contractor.
5. The assigned contractor receives the complaint in their respective dashboard.
6. The contractor works on the issue, updates its status, and uploads completion proof.
7. Citizens can track the complaint and view its latest status.

🧰 Technology Stack :

| Layer | Technologies |
|---|---|
| Frontend | HTML5, CSS3, JavaScript |
| Backend | Node.js, Express.js |
| Database | MySQL |
| File Uploads | Multer |
| Maps | Leaflet.js |
| Version Control | Git, GitHub |
| Frontend Deployment | Vercel |
| Backend Deployment | Render |

🏗️ Project Architecture :

The application follows a client-server architecture:

- **Frontend:** Provides interfaces for citizens, administrators, and contractors.
- **Backend:** Handles API requests, complaint management, assignment workflows, authentication-related operations, and file uploads.
- **Database:** Stores user, contractor, complaint, and complaint-resolution information.

The frontend communicates with the backend through REST API endpoints, while MySQL manages the application's persistent data.

## 📂 Project Structure


SmartSeva/
│
├── frontend/
│   ├── css/
│   ├── js/
│   ├── images/
│   └── *.html
│
├── backend/
│   ├── server.js
│   ├── db.js
│   └── ...
│
├── database/
│   └── myschema.sql
│
├── .gitignore
├── package.json
└── README.md


⚙️ Local Installation & Setup

Prerequisites : 
- Node.js and npm
- MySQL Server
- Git

1. Clone the Repository : git clone https://github.com/AlokeShaw1234/SmartSeva.git

2. Navigate to the Project : cd SmartSeva

3. Install Backend Dependencies : npm install

4. Configure Environment Variables : Create a `.env` file in the project root or configure it according to your backend configuration.

Example:

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=smartseva
DB_PORT=3306
PORT=3000

Use your actual MySQL database credentials. Never commit your `.env` file to GitHub.

5. Configure the Database : 

Create the MySQL database and execute the SQL schema provided in the `database` directory.

6. Start the Backend Server : npm start

7. Run the Frontend : Open the frontend's main HTML page using VS Code Live Server or a local static server.

Ensure the frontend API base URL points to your local backend server when testing locally.

🌐 Deployment :

- Frontend: Deployed using Vercel.
- Backend: Hosted using Render.
- Database: MySQL.

Live Frontend: https://smartseva-frontend.vercel.app/

Source Code : https://github.com/AlokeShaw1234/SmartSeva

🎯 Project Objectives:

- Digitize the civic complaint registration process.
- Improve communication between citizens, administrators, and contractors.
- Enable category-based complaint assignment.
- Provide better visibility into complaint progress.
- Support evidence-based complaint resolution through media uploads and completion proof.

📚 Key Learning Outcomes :

Through SmartSeva, I gained practical experience in:

- Building full-stack web applications using HTML, CSS, JavaScript, Node.js, and Express.js.
- Designing and integrating REST APIs.
- Working with relational databases and MySQL queries.
- Implementing file uploads using Multer.
- Managing role-specific interfaces and workflows.
- Integrating interactive maps using Leaflet.js.
- Using Git and GitHub for version control.
- Deploying a frontend application using Vercel and working with backend hosting on Render.

👨‍💻 Developer : 

Aloke Shaw

- GitHub: https://github.com/alokeshaw1234
- LinkedIn: https://www.linkedin.com/in/aloke-shaw-b68290289

*SmartSeva is developed as a practical full-stack project to explore how technology can help improve civic issue reporting and management.*
