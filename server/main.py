from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import PyPDF2
import spacy
import io
import re
from typing import List, Set

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load NER models
nlp_custom = spacy.load(r"C:\Users\harih\OneDrive\Desktop\FastAPI\custom_ner_model")
nlp_trf = spacy.load(r"C:\Users\harih\OneDrive\Desktop\FastAPI\trained_ner_model3")

def extract_skills_from_text(text: str) -> Set[str]:
    # Common technical skills to look for
    common_skills = {
        "python", "javascript", "java", "c++", "react", "angular", "vue", "node.js",
        "express", "django", "flask", "sql", "mongodb", "postgresql", "mysql",
        "aws", "azure", "gcp", "docker", "kubernetes", "git", "agile", "scrum",
        "machine learning", "artificial intelligence", "data analysis", "data science",
        "html", "css", "typescript", "redux", "graphql", "rest api", "ci/cd",
        "jenkins", "terraform", "blockchain", "web3", "solidity", "rust"
    }
    
    # Convert text to lowercase for case-insensitive matching
    text_lower = text.lower()
    
    # Find all skill matches
    found_skills = set()
    for skill in common_skills:
        if skill in text_lower:
            found_skills.add(skill.title())  # Store skills in Title Case
    
    return found_skills

def compare_skills(resume_skills: Set[str], job_skills: Set[str]) -> dict:
    matching_skills = resume_skills.intersection(job_skills)
    missing_skills = job_skills - resume_skills
    additional_skills = resume_skills - job_skills
    
    # Calculate match percentage based on required skills
    if len(job_skills) > 0:
        match_percentage = (len(matching_skills) / len(job_skills)) * 100
    else:
        match_percentage = 0
    
    return {
        "matching": sorted(list(matching_skills)),
        "missing": sorted(list(missing_skills)),
        "additional": sorted(list(additional_skills)),
        "matchPercentage": round(match_percentage, 1)
    }

def extract_info_from_pdf(pdf_content: bytes, job_description: str):
    pdf_file = io.BytesIO(pdf_content)
    reader = PyPDF2.PdfReader(pdf_file)

    # Extract text from PDF
    text = ""
    for page in reader.pages:
        text += page.extract_text() or ""

    if not text.strip():
        return {"error": "No text could be extracted from the PDF"}

    # Process with NER model
    doc = nlp_custom(text)

    # Extract entities
    entities = {"name": "", "skills": "", "education": "", "experience": "", "dob": ""}
    for ent in doc.ents:
        if ent.label_ == "NAME":
            entities["name"] = ent.text
        elif ent.label_ == "SKILL":
            entities["skills"] += ent.text + ", "
        elif ent.label_ == "EDU":
            entities["education"] += ent.text + ", "
        elif ent.label_ == "EXP":
            entities["experience"] += ent.text + ", "
        elif ent.label_ == "DOB":
            entities["dob"] = ent.text

    # Clean up extracted text
    for key in entities:
        entities[key] = entities[key].strip(", ")

    # Extract and compare skills
    resume_skills = extract_skills_from_text(text)
    job_skills = extract_skills_from_text(job_description)
    
    # Add skill comparison to the response
    entities["skillMatch"] = compare_skills(resume_skills, job_skills)

    return entities

@app.post("/api/extract")
async def extract_entities(
    resume: UploadFile = File(...),
    job_description: str = Form(...)
):
    try:
        pdf_content = await resume.read()
        extracted_data = extract_info_from_pdf(pdf_content, job_description)

        if "error" in extracted_data:
            return {"message": "Extraction failed", "error": extracted_data["error"]}

        return {
            "message": "Analysis complete",
            "filename": resume.filename,
            "data": extracted_data
        }
    except Exception as e:
        return {"message": "Error processing file", "error": str(e)}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)