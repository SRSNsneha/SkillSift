from flask import Flask, request, jsonify,Blueprint,render_template
from flask_cors import CORS
from azure.ai.formrecognizer import DocumentAnalysisClient
from azure.core.credentials import AzureKeyCredential
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import spacy
from spacy.matcher import PhraseMatcher
import os, re, requests
from werkzeug.utils import secure_filename
from dotenv import load_dotenv
load_dotenv()


feature2_routes = Blueprint("feature2", __name__)
CORS(feature2_routes)  # ✅ CORS only for this blueprint

@feature2_routes.route("/feature2")
def feature1_page():
    return render_template("feature2.html")

# Supabase config
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_API_KEY = os.getenv("SUPABASE_API_KEY")
SUPABASE_BUCKET = os.getenv("SUPABASE_BUCKET")
SUPABASE_HEADERS = {
    "apikey": SUPABASE_API_KEY,
    "Authorization": f"Bearer {SUPABASE_API_KEY}",
    "Content-Type": "application/json"
}

# Azure setup
AZURE_FORM_RECOGNIZER_ENDPOINT = os.getenv("AZURE_ENDPOINT")
AZURE_FORM_RECOGNIZER_KEY = os.getenv("AZURE_KEY")
client = DocumentAnalysisClient(endpoint=AZURE_FORM_RECOGNIZER_ENDPOINT, credential=AzureKeyCredential(AZURE_FORM_RECOGNIZER_KEY))

UPLOAD_FOLDER = "temp_resumes"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


# spaCy skill matcher
nlp = spacy.load("en_core_web_sm")
matcher = PhraseMatcher(nlp.vocab, attr="LOWER")
with open("skills_dataset.csv", "r", encoding="utf-8") as f:
    skills_list = [line.strip().lower() for line in f if line.strip()]
matcher.add("SKILLS", [nlp(skill) for skill in skills_list])

def extract_email(text):
    match = re.search(r"[\w\.-]+@[\w\.-]+\.\w+", text)
    return match.group() if match else "Not found"

def extract_phone(text):
    match = re.search(r"(\+91[\s\-\.]*)?(\d{10}|\d{5}[\s\-\.]?\d{5})", text)
    if match:
        digits = re.sub(r"\D", "", match.group())
        return "+91" + digits[-10:] if len(digits) >= 10 else digits
    return "Not found"

def extract_skills(text):
    doc = nlp(text.lower())
    matches = matcher(doc)
    return list(set(span.text.lower() for _, start, end in matches for span in [doc[start:end]]))

# === ROUTES ===

@feature2_routes.route("/store_resume", methods=["POST"])
def store_resume():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    name_id = request.form.get("name_id", "").strip().lower()
    if not name_id or not file.filename:
        return jsonify({"error": "Missing name_id or file"}), 400

    filename = secure_filename(file.filename)
    local_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(local_path)

    # Upload to Supabase Storage using PUT instead of POST
    with open(local_path, "rb") as f:
        upload_res = requests.put(
            f"{SUPABASE_URL}/storage/v1/object/{SUPABASE_BUCKET}/{name_id}/{filename}",
            headers={
                "apikey": SUPABASE_API_KEY,
                "Authorization": f"Bearer {SUPABASE_API_KEY}",
                "Content-Type": "application/pdf"
            },
            data=f
        )
        print("Upload Status Code:", upload_res.status_code)
        print("Upload Response:", upload_res.text)

    if not upload_res.ok:
        return jsonify({"error": "Failed to store the file...try using a different ID or reload the page."}), 500

    # Generate public file URL
    file_url = f"{SUPABASE_URL}/storage/v1/object/public/{SUPABASE_BUCKET}/{name_id}/{filename}"

    # Extract text from PDF using Azure Form Recognizer
    with open(local_path, "rb") as pdf:
        poller = client.begin_analyze_document("prebuilt-document", document=pdf)
        result = poller.result()

    text = "\n".join([line.content for page in result.pages for line in page.lines])
    skills = extract_skills(text)

    metadata = {
        "name_id": name_id,
        "email": extract_email(text),
        "phone": extract_phone(text),
        "file_name": filename,
        "file_url": file_url,
        "content": text,
        "skills": skills
    }

    # Insert metadata into Supabase Table
    res = requests.post(f"{SUPABASE_URL}/rest/v1/resumes", headers=SUPABASE_HEADERS, json=metadata)
    if not res.ok:
        return jsonify({"error": "Failed to store metadata in Supabase"}), 500

    return jsonify({"message": "Resume uploaded successfully! You can upload more resumes under this same ID to compare, or scroll down to analyze them against a job description."})

@feature2_routes.route("/match_resumes", methods=["POST"])
def match_resumes():
    data = request.get_json()
    name_id = data.get("name_id", "").strip().lower()
    jd = data.get("job_description", "").strip()
    if not name_id or not jd:
        return jsonify({"error": "Missing name_id or job description"}), 400

    res = requests.get(f"{SUPABASE_URL}/rest/v1/resumes?name_id=eq.{name_id}", headers=SUPABASE_HEADERS)
    if not res.ok or not res.json():
        return jsonify({"error": f"No resumes found for ID '{name_id}'"}), 404

    resumes = res.json()
    documents = [jd] + [r["content"] for r in resumes]
    tfidf = TfidfVectorizer(stop_words="english").fit_transform(documents)
    scores = cosine_similarity(tfidf[0:1], tfidf[1:]).flatten()
    jd_skills = extract_skills(jd)

    for i, score in enumerate(scores):
        resumes[i]["match_percent"] = round(score * 100, 2)
        resumes[i]["matched_skills"] = list(set(resumes[i]["skills"]) & set(jd_skills))
        resumes[i]["missing_skills"] = list(set(jd_skills) - set(resumes[i]["skills"]))

    resumes.sort(key=lambda r: r["match_percent"], reverse=True)
    return jsonify({"results": resumes[:3]})

@feature2_routes.route("/download_resume/<name_id>/<filename>")
def download_resume(name_id, filename):
    name_id = name_id.strip().lower()
    filename = filename.strip()
    file_url = f"{SUPABASE_URL}/storage/v1/object/public/{SUPABASE_BUCKET}/{name_id}/{filename}"
    return jsonify({"download_url": file_url})

@feature2_routes.route("/clear_resumes", methods=["DELETE"])
def clear_resumes():
    name_id = request.args.get("name_id", "").strip().lower()
    if not name_id:
        return jsonify({"error": "Missing name_id"}), 400

    # --- 1. Delete metadata from table ---
    delete_meta = requests.delete(
        f"{SUPABASE_URL}/rest/v1/resumes?name_id=eq.{name_id}",
        headers={**SUPABASE_HEADERS, "Prefer": "return=representation"}
    )

    # --- 2. List files in storage ---
    list_files = requests.get(
        f"{SUPABASE_URL}/storage/v1/object/list/{SUPABASE_BUCKET}?prefix={name_id}/",
        headers=SUPABASE_HEADERS
    )

    if list_files.ok:
        files = list_files.json()
        for item in files:
            file_name = item.get("name")
            if file_name:
                # Delete each file
                requests.delete(
                    f"{SUPABASE_URL}/storage/v1/object/{SUPABASE_BUCKET}/{name_id}/{file_name}",
                    headers=SUPABASE_HEADERS
                )

    return jsonify({"message": f"All resumes and files cleared for ID '{name_id}'"})
@feature2_routes.route("/check_user_id")
def check_user_id():
    user_id = request.args.get("user_id", "").strip().lower()
    if not user_id:
        return jsonify({"exists": False})

    res = requests.get(
        f"{SUPABASE_URL}/rest/v1/resumes?name_id=eq.{user_id}",
        headers=SUPABASE_HEADERS
    )
    exists = res.ok and len(res.json()) > 0
    return jsonify({"exists": exists})

