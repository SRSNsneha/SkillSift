from flask import Blueprint, request, jsonify, render_template
from azure.ai.formrecognizer import DocumentAnalysisClient
from azure.core.credentials import AzureKeyCredential
import pandas as pd
from flask_cors import CORS
import re,os
from dotenv import load_dotenv
load_dotenv()

feature1_routes = Blueprint("feature1", __name__)
CORS(feature1_routes)  # ✅ CORS only for this blueprint

# DO NOT initialize Flask app here

@feature1_routes.route("/feature1")
def feature1_page():
    return render_template("feature1.html")
# Azure credentials
endpoint = os.getenv("AZURE_ENDPOINT")
key = os.getenv("AZURE_KEY")
client = DocumentAnalysisClient(endpoint=endpoint, credential=AzureKeyCredential(key))
print("✅ Connected to Azure Form Recognizer!")

# Load skills from CSV
skills_df = pd.read_csv("skills_dataset.csv")
all_skills = set(skill.strip().lower() for skill in skills_df['Skill'].dropna())
print(f"✅ Loaded {len(all_skills)} skills from CSV.")

def extract_skills_from_text(text):
    words = re.findall(r'\b\w+\b', text.lower())
    return list(set(word for word in words if word in all_skills))

def extract_phone(text):
    match = re.search(r"(\+91[\s\-\.]*)?(\d{10}|\d{5}[\s\-\.]?\d{5})", text)
    if match:
        digits = re.sub(r"\D", "", match.group())
        return "+91" + digits[-10:] if len(digits) >= 10 else digits
    return "Not found"

@feature1_routes.route("/analyze_resume", methods=["POST"])
def analyze_resume():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "Empty filename"}), 400

    poller = client.begin_analyze_document("prebuilt-document", document=file)
    result = poller.result()
    all_text = "\n".join([line.content for page in result.pages for line in page.lines])

    email_match = re.search(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", all_text)
    email = email_match.group() if email_match else "Not found"
    phone = extract_phone(all_text)
    lines = all_text.strip().split('\n')
    name = lines[0] if len(lines[0].split()) <= 4 else "Not found"

    education_section = []
    start_collecting = False
    for line in lines:
        lower = line.strip().lower()
        if "education" in lower:
            start_collecting = True
            continue
        if start_collecting and any(kw in lower for kw in ["project", "experience", "certification", "achievement", "summary", "internship", "activities"]):
            break
        if start_collecting and line.strip():
            education_section.append(line.strip())

    skills_section = []
    start_skills = False
    for line in lines:
        lower = line.strip().lower()
        if not start_skills and "skill" in lower and len(lower) < 30:
            start_skills = True
            continue
        if start_skills and any(kw in lower for kw in ["education", "project", "experience", "certification", "achievement", "summary", "internship", "activities"]):
            break
        if start_skills and line.strip():
            skills_section.append(line.strip())

    found_skills = extract_skills_from_text(all_text)
    job_description = request.form.get("job_description", "").lower()
    job_skills = extract_skills_from_text(job_description)

    matched_skills = [skill for skill in job_skills if skill in found_skills]
    missing_skills = list(set(job_skills) - set(matched_skills))
    match_percentage = round((len(matched_skills) / len(job_skills)) * 100, 2) if job_skills else 0

    return jsonify({
        "name": name,
        "email": email,
        "phone": phone,
        "education": education_section,
        "skills_from_resume_section": skills_section,
        "skills_from_text": found_skills,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "skill_match_percentage": match_percentage,
        "job_match_status": "success" if job_skills else "no job description or match"
    })
