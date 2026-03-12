# 📈 FreelanceFlow: Smart Business Dashboard

FreelanceFlow is a professional-grade project management and financial tracking dashboard built with **React** and **Google Sheets API**. Designed specifically for AI Automation experts and freelancers, it offers real-time currency conversion, automated bookkeeping, and professional PDF invoice generation.



## 🚀 Key Features

* **Live Google Sheets Sync:** Uses Google Apps Script as a backend for real-time CRUD operations (Create, Read, Update, Archive).
* **Global Currency Switcher:** Instant conversion of earnings from PKR to any global currency (USD, CAD, EUR, etc.) using live exchange rates.
* **Advanced Search & Autocomplete:** "Google-style" search suggestions with filters for Project Name, Client, or Category.
* **Soft-Delete & Trash System:** Archive projects to a "Trash" view to maintain data integrity with the ability to restore them instantly.
* **Professional PDF Export:** Generate clean, branded PDF invoices for single or multiple selected projects using `jsPDF` and `autoTable`.
* **Selection & Bulk Actions:** Select multiple project records to generate a grouped summary report for specific clients.
* **Responsive Dark UI:** A sleek, modern interface built with Tailwind-style CSS and Framer Motion for smooth animations.

## 🛠️ Tech Stack

* **Frontend:** React.js, Framer Motion (Animations), Lucide React (Icons).
* **Backend:** Google Apps Script (Serverless).
* **Database:** Google Sheets (Cloud Storage).
* **APIs:** Google Sheets API v4, Open Exchange Rates API.
* **PDF Engine:** jsPDF, jspdf-autotable.



## 📋 Prerequisites

Before running the project locally, ensure you have:
* **Node.js** installed.
* A **Google Cloud Project** with the Sheets API enabled.
* A **Google Sheet** set up with the following columns: 
    `Project Name | Client | Status | Earnings (PKR) | Category`

## ⚙️ Installation & Setup

1.  **Clone the Repository:**
    ```bash
    git clone [https://github.com/shahrozimran/FreelanceFlow.git](https://github.com/shahrozimran/FreelanceFlow.git)
    cd FreelanceFlow
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    npm install jspdf jspdf-autotable
    ```

3.  **Configure Environment Variables:**
    Create a `.env` file in the root directory and add your keys:
    ```env
    VITE_SHEET_ID=your_google_sheet_id
    VITE_API_KEY=your_google_cloud_api_key
    VITE_SCRIPT_URL=your_deployed_apps_script_url
    ```

4.  **Run Locally:**
    ```bash
    npm run dev
    ```

## 📄 Apps Script Backend

The backend logic is handled via a deployed Web App script. It manages the `POST` requests for different actions:

* `ADD`: Appends a new project row.
* `UPDATE`: Modifies existing project details.
* `DELETE`: Marks a project status as `Disabled` (Soft Delete).
* `RESTORE`: Re-activates an archived project.

## 📸 Screenshots

| Active Dashboard | PDF Invoice Generation |
| :--- | :--- |
| ![Dashboard Overview](https://via.placeholder.com/400x250?text=Dashboard+UI) | ![PDF Export](https://via.placeholder.com/400x250?text=PDF+Invoice+Preview) |

## 🛡️ Security Note

As a cybersecurity student, I have ensured that:
* API keys are handled via environment variables.
* The project uses a "Soft Delete" mechanism to prevent accidental data loss.
* Input sanitization is performed on project names and earnings.

## 👨‍💻 Author

**Shahroz Imran**
* Artificial Intelligence Student @ UCP
* Cybersecurity & Ethical Hacking Enthusiast
* AI Automation & E-commerce Expert

---
*Generated for FreelanceFlow - Version 2.0*