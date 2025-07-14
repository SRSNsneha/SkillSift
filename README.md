# SkillSift – Resume Analyzer Web App

SkillSift is a smart resume analyzer built using Flask that provides two powerful features for job seekers, recruiters, and students to extract insights from resumes and evaluate job fit.

---
### 🚀 Live Demo

[Check out the live site here!](https://srsnsneha.github.io/SkillSift/)

## 🔥 Features

### ✨ Feature 1: Single Resume Analyzer (Skill Match)
- Upload a single resume and paste a job description.
- Automatically extracts:
  - Name, email, phone  
  - Education details  
  - Skills listed in resume
- Compares resume skills with job description using a preloaded **CSV skill set**.
- Displays:
  - Matched and missing skills  
  - Skill match percentage  

> 💡 Ideal for quick resume checks before applying!

---

### 📚 Feature 2: Multi-Resume Ranker with Storage (PIN-Protected)
This feature allows users to securely upload and manage multiple resumes tied to a **unique Resume ID**, and later analyze them all against a job description. All actions are protected using a **4-digit PIN**, ensuring privacy and ownership of uploaded resumes.

#### 🔐 Step 1: Resume Upload (Secure)
- Users start by entering a **Resume ID** (e.g., `xyz_123`) and clicking **Next**.
- If the Resume ID is **new**, you're prompted to set a **4-digit PIN** for future access.
- If the Resume ID already exists, you're prompted to **verify your PIN**.
- After verification, upload one or more **PDF resumes** under that ID.
- All resumes are stored and linked to the Resume ID, and can be cleared later if needed.

#### 🔍 Step 2: Resume Analysis (Secure)
- Once resumes are uploaded, navigate to the **"Analyze Resume"** section.
- Enter your Resume ID and correct PIN again to unlock the analysis panel.
- Paste a job description into the text area and click **Analyze**.
- The system:
  - Uses **TF-IDF + Cosine Similarity** to compute match scores.
  - Ranks all uploaded resumes by match percentage.
  - Displays top matches, along with **matched and missing skills**.
  - Provides **download buttons** for the best-fitting resumes.

✅ This entire flow is **PIN-protected** — only users with the correct PIN for a Resume ID can upload, analyze, or delete resumes. Unauthorized attempts are blocked.

> 📂 Use “Clear All Resumes” to delete your data and start fresh under the same Resume ID.

---

### 🎨 Homepage Extras
- The homepage includes navigation to both features.
- A **background selector** is available to customize the visual theme of the app.

---

## 🛠️ Tech Stack

- **Frontend**: HTML, CSS, JavaScript  
- **Backend**: Python (Flask)  
- **OCR & Text Extraction**: Azure Form Recognizer  
- **Skill Matching**:  
  - Feature 1: CSV-based word matching  
  - Feature 2: TF-IDF + Cosine Similarity (via scikit-learn)  
- **Data Storage**:  
  - Resume files: Supabase Storage  
  - Metadata: Supabase Postgres Table (with RLS by user ID)

---

## 🚀 Getting Started (Local)

1. Clone the repo  
   ```bash
   git clone https://github.com/SRSNsneha/SkillSift.git
