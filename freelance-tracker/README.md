# 📈 FreelanceFlow: Smart Business Dashboard

FreelanceFlow is a professional-grade project management and financial tracking dashboard built with **React** and **Google Sheets API**. Designed specifically for AI Automation experts and freelancers, it offers real-time currency conversion, automated bookkeeping, and advanced multi-client PDF invoice generation.



## 🚀 Key Features

* [cite_start]**Live Google Sheets Sync:** Uses Google Apps Script as a backend for real-time CRUD operations: Add, Update, Archive, and Restore[cite: 1].
* [cite_start]**Global Currency Switcher:** Instant conversion of earnings from PKR to any global currency using live exchange rates[cite: 1].
* [cite_start]**Advanced Search & Autocomplete:** "Google-style" search suggestions with filters for Project Name, Client, or Category[cite: 1].
* [cite_start]**Soft-Delete & Trash System:** Archive projects to a "Trash" view to maintain data integrity with instant restoration capability[cite: 1].
* [cite_start]**Bulk PDF Export & Selection:** Select multiple records across different clients to generate a grouped summary report[cite: 1].
* [cite_start]**Unique Client Grouping:** Automatically detects and lists unique client names in the header of multi-project exports[cite: 1].
* [cite_start]**Automated Financial Summing:** Exported PDFs now automatically calculate and display the **Total Amount** at the bottom of the invoice table[cite: 1].
* [cite_start]**Responsive Dark UI:** Sleek, modern interface built with Tailwind-style CSS and Framer Motion for smooth animations[cite: 1].

## 🛠️ Tech Stack

* **Frontend:** React.js, Framer Motion (Animations), Lucide React (Icons).
* [cite_start]**Backend:** Google Apps Script (Serverless)[cite: 1].
* [cite_start]**Database:** Google Sheets (Cloud Storage)[cite: 1].
* **APIs:** Google Sheets API v4, Open Exchange Rates API.
* [cite_start]**PDF Engine:** jsPDF, jspdf-autotable (Manual Plugin Registration for Vite compatibility)[cite: 1].



## 📋 Prerequisites

Before running the project locally, ensure you have:
* **Node.js** installed.
* A **Google Cloud Project** with the Sheets API enabled.
* A **Google Sheet** set up with the following columns: 
    `Project Name | Client | Status | Earnings (PKR) | [cite_start]Category` [cite: 1]

## ⚙️ Installation & Setup

1. **Clone the Repository:**
    ```bash
    git clone [https://github.com/shahrozimran/FreelanceFlow.git](https://github.com/shahrozimran/FreelanceFlow.git)
    cd FreelanceFlow
    ```

2. **Install Dependencies:**
    ```bash
    npm install
    npm install jspdf jspdf-autotable
    ```

3. **Configure Environment Variables:**
    Create a `.env` file in the root directory and add your keys:
    ```env
    VITE_SHEET_ID=your_google_sheet_id
    VITE_API_KEY=your_google_cloud_api_key
    VITE_SCRIPT_URL=your_deployed_apps_script_url
    ```

4. **Run Locally:**
    ```bash
    npm run dev
    ```

## 📄 Apps Script Backend

The backend logic is handled via a deployed Web App script. It manages the `POST` requests for different actions:

* [cite_start]`ADD`: Appends a new project row with "Active" status[cite: 1].
* [cite_start]`UPDATE`: Modifies existing project details[cite: 1].
* [cite_start]`DELETE`: Marks a project status as `Disabled` (Soft Delete)[cite: 1].
* [cite_start]`RESTORE`: Re-activates an archived project to the main view[cite: 1].

## 🛡️ Security Note

As a cybersecurity student, I have ensured that:
* [cite_start]**Environment Isolation:** API keys and sensitive IDs are handled strictly via environment variables[cite: 1].
* [cite_start]**Data Integrity:** The "Soft Delete" mechanism prevents accidental permanent data loss[cite: 1].
* [cite_start]**Sanitized Reporting:** PDF generation dynamically calculates totals from the frontend state to ensure accuracy[cite: 1].

## 👨‍💻 Author

**Shahroz Imran**
* [cite_start]Artificial Intelligence Student @ UCP [cite: 1]
* [cite_start]Cybersecurity & Ethical Hacking Enthusiast [cite: 1]
* [cite_start]AI Automation & E-commerce Expert [cite: 1]

---
*Generated for FreelanceFlow - Version 2.1 (Multi-Export Update)*