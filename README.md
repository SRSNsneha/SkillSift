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

### 📚 Feature 2: Multi-Resume Ranker with Storage
- Enter a **User ID** to store all your resumes privately.
- Upload multiple resumes under one user ID.
- Paste a job description to:
  - Rank all uploaded resumes by **match percentage**
  - View matched and missing skills for the top 3 resumes, with a download option for each.
- Uses **TF-IDF + Cosine Similarity** for intelligent ranking.

> 📂 Your data is linked to a unique ID – no login is needed. You can also clear all resumes under your ID if you'd like to upload a new set without the previously uploaded ones for comparison.

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
