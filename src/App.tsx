import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText } from "lucide-react";
import axios from "axios";
import { Pie } from "react-chartjs-2";
import "chart.js/auto";

interface ExtractionResult {
  name: string;
  skills: string;
  education: string;
  experience: string;
  dob: string;
  skillMatch: {
    matching: string[];
    missing: string[];
    additional: string[];
    matchPercentage: number;
  };
}

function App() {
  const [resume, setResume] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [extractedData, setExtractedData] = useState<ExtractionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      setResume(acceptedFiles[0]);
      setError(null);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (!resume) throw new Error("Please upload a resume");
      if (!jobDescription) throw new Error("Please enter a job description");

      const formData = new FormData();
      formData.append("resume", resume);
      formData.append("job_description", jobDescription);

      const response = await axios.post("http://localhost:8000/api/extract", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data && response.data.data) {
        setExtractedData(response.data.data);
      } else if (response.data.error) {
        throw new Error(response.data.error);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setExtractedData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const renderPieChart = () => {
    if (!extractedData?.skillMatch) return null;

    const data = {
      labels: ["Matching Skills", "Missing Skills"],
      datasets: [
        {
          data: [
            extractedData.skillMatch.matchPercentage,
            100 - extractedData.skillMatch.matchPercentage,
          ],
          backgroundColor: ["#4CAF50", "#FF5252"],
          borderWidth: 0,
        },
      ],
    };

    const options = {
      plugins: {
        legend: {
          position: "bottom" as const,
        },
      },
    };

    return (
      <div className="w-64 h-64 mx-auto">
        <Pie data={data} options={options} />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Resume Skill Analyzer</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Upload Resume</h2>
              <div
                {...getRootProps()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-blue-500 transition-colors"
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center">
                  <FileText className="w-12 h-12 text-gray-400 mb-2" />
                  <p className="text-gray-600 text-center">
                    Drag & drop your resume here, or click to select
                  </p>
                  {resume && (
                    <p className="mt-2 text-sm text-blue-600">{resume.name}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Job Description</h2>
              <textarea
                className="w-full h-40 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Paste the job description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={isLoading || !resume || !jobDescription}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? "Analyzing..." : "Analyze Skills"}
            </button>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}
          </div>

          {extractedData && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Skill Match Analysis</h2>
                {renderPieChart()}
                <div className="mt-6">
                  <h3 className="font-semibold text-lg mb-2">Match Details</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-green-600">Matching Skills</h4>
                      <p className="text-gray-600">
                        {extractedData.skillMatch.matching.join(", ") || "None"}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-red-600">Missing Skills</h4>
                      <p className="text-gray-600">
                        {extractedData.skillMatch.missing.join(", ") || "None"}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-600">Additional Skills</h4>
                      <p className="text-gray-600">
                        {extractedData.skillMatch.additional.join(", ") || "None"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Extracted Information</h2>
                <div className="space-y-2">
                  <p><strong>Name:</strong> {extractedData.name}</p>
                  <p><strong>Education:</strong> {extractedData.education}</p>
                  <p><strong>Experience:</strong> {extractedData.experience}</p>
                  <p><strong>Skills:</strong> {extractedData.skills}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;