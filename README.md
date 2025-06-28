# 📄 Project_RES: Resume Extraction and Skills Analyzer

This project is an AI-powered web application that automatically extracts relevant information from resumes and compares it against a job description to analyze skill match levels. It's designed to help HR teams and job applicants identify strengths, gaps, and suitability for specific roles.

## 🚀 Features

- ✅ Upload resumes in PDF format
- 📄 Extract candidate details like name, contact, education, experience, and skills
- 🔍 Upload a Job Description (JD) and match against resume content
- 📊 Visual skill match analysis (Matched, Missing, Extra)
- 💡 Suggestions for improving resume relevance based on JD
- 🌐 Clean, user-friendly web interface (Flask + HTML/CSS)

## 🛠️ Tech Stack

| Area              | Technology Used                   |
|-------------------|-----------------------------------|
| Backend           | Python, Flask                     |
| Resume Parsing    | `PyMuPDF`, `pdfminer`, `re`, `Spacy` |
| Skill Matching    | Fuzzy Matching, NLP               |
| Frontend          | HTML, CSS, Bootstrap (optional)   |
| Data Processing   | Pandas, Numpy                     |

## ⚙️ How to Run Locally

### 🔸 Prerequisites
- Python 3.8+
- pip

### 🔹 Setup

```bash
git clone https://github.com/hariharasudhanm01/Project_RES-Resume-Extraction-and-Skills-Analyzer.git
cd Project_RES-Resume-Extraction-and-Skills-Analyzer
pip install -r requirements.txt
python app.py
```
### Output

![image](https://github.com/user-attachments/assets/e76c42f6-6dcf-4540-8312-560216ef67ea)

### Use Cases

Job Seekers: Understand how well your resume matches the job you're applying for.

Recruiters/HR: Quickly filter applicants by matching skills with job descriptions.

Career Coaches: Help clients identify skill gaps and improve resumes accordingly.

### 🙋‍♂️ Author

Hariharasudhan M

### 💬 Feedback

Feel free to raise issues or suggest improvements via Issues.

