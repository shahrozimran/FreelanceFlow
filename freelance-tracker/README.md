# 📈 FreelanceFlow: Smart Business Dashboard

FreelanceFlow is a professional-grade project management and financial tracking dashboard built with **React** and **Google Sheets API**. Designed specifically for AI Automation experts and freelancers, it offers a lightning-fast user experience through optimistic updates and advanced multi-client reporting.

## 🚀 Key Features

* **Lightning-Fast Optimistic UI:** Add, Update, and Archive operations now happen instantly (~16ms). The app updates your screen first and syncs with Google Sheets in the background.
* **Intelligent Data Normalization:** Automatically converts Project, Client, and Category names to **Proper Case** (e.g., "web app" → "Web App") to prevent duplicate entities and maintain data consistency.
* **Form Autosuggest:** Field-specific suggestions for Project Names, Clients, and Earnings based on your existing data to speed up entry.
* **Interactive PDF Exports:** * **Custom Notes:** A popup window allows you to add unique instructions or notes to each invoice before generation.
    * **Bulk Selection:** Group multiple projects into one professional summary report.
    * **Professional Signature:** Every export includes a branded "Regards" block with your specialist title.
* **Global Currency Switcher:** Instant conversion of earnings from PKR to any global currency using live exchange rates.
* **Soft-Delete & Trash System:** Maintain data integrity with an archive view and instant restoration capability.

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
    ```

3.  **Configure Environment Variables:**
    Create a `.env` file in the root directory (this file is git-ignored for security):
    ```env
    VITE_SHEET_ID=your_google_sheet_id
    VITE_API_KEY=your_google_cloud_api_key
    VITE_SCRIPT_URL=your_deployed_apps_script_url
    VITE_GITHUB_URL=[https://github.com/shahrozimran](https://github.com/shahrozimran)
    VITE_LINKEDIN_URL=your_linkedin_profile_url
    ```

4.  **Run Locally:**
    ```bash
    npm run dev
    ```

## 📄 Apps Script Backend

The backend logic is handled via a deployed Web App script. It manages `POST` requests for different actions:

* `ADD`: Appends a new project row with "Active" status.
* `UPDATE`: Modifies existing project details with normalized text.
* `DELETE`: Marks a project status as `Disabled` (Soft Delete).
* `RESTORE`: Re-activates an archived project to the main view.

## 🛡️ Security & Performance Note

As a cybersecurity student, I have implemented:
* **Environment Isolation:** All sensitive identifiers (API keys, Sheet IDs) and personal social links are strictly handled via `.env` files.
* **Data Integrity:** Input normalization ensures strings like "usman" and "Usman" are never treated as different entities, preventing data fragmentation.
* **Non-Blocking Workflow:** UI updates are decoupled from API latency, providing a premium, high-speed user experience.

## 👨‍💻 Author

**Shahroz Imran**
* Artificial Intelligence Student @ UCP
* Cybersecurity & Ethical Hacking Enthusiast
* AI Automation & E-commerce Expert

---
*Generated for FreelanceFlow - Version 3.0 (Performance & Normalization Update)*