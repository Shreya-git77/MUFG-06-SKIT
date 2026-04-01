import React, { useState } from "react";
import axios from "axios";
import "./App.css";

const API_URL =
  "https://heart-disease-detection-system-m0b2.onrender.com/predict";

function App() {
  const [formData, setFormData] = useState({
    age: 50,
    sex: 1,
    cp: 0,
    trestbps: 120,
    chol: 200,
    fbs: 0,
    restecg: 1,
    thalach: 150,
    exang: 0,
    oldpeak: 1.0,
    slope: 1,
    ca: 0,
    thal: 2,
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ FIXED handleChange (allows empty values)
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Allow user to completely clear the input
    if (value === "") {
      setFormData({ ...formData, [name]: "" });
      return;
    }

    const formattedValue =
      name === "oldpeak" ? parseFloat(value) : parseInt(value);

    setFormData({
      ...formData,
      [name]: formattedValue,
    });
  };

  // ✅ CLEAN DATA before sending to backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setResult(null);
    setLoading(true);

    // Convert empty fields to 0 before sending
    const cleanedData = {};
    Object.keys(formData).forEach((key) => {
      cleanedData[key] =
        formData[key] === "" ? 0 : formData[key];
    });

    try {
      const response = await axios.post(API_URL, cleanedData, {
        headers: { "Content-Type": "application/json" },
      });

      setResult(response.data);
    } catch (error) {
      console.error(
        "API Error:",
        error.response?.data || error.message
      );
      alert(
        error.response?.data?.error ||
          "Connection error. Is Render awake?"
      );
    } finally {
      setLoading(false);
    }
  };

  const labels = {
    age: "Age",
    sex: "Gender",
    cp: "Chest Pain Type",
    trestbps: "Resting Blood Pressure",
    chol: "Cholesterol Level",
    fbs: "Fasting Blood Sugar",
    restecg: "Resting ECG",
    thalach: "Maximum Heart Rate",
    exang: "Exercise Induced Angina",
    oldpeak: "ST Depression",
    slope: "Slope of ST Segment",
    ca: "Major Vessels",
    thal: "Thalassemia",
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>CardioGuard AI</h1>
        <p>Heart Disease Risk Prediction System</p>
      </header>

      <main className="container">
        <form onSubmit={handleSubmit}>
          <div className="grid">
            {Object.keys(formData).map((key) => (
              <div key={key} className="input-group">
                <label>{labels[key]}</label>

                {key === "sex" ? (
                  <select
                    name="sex"
                    value={formData.sex}
                    onChange={handleChange}
                  >
                    <option value="1">Male</option>
                    <option value="0">Female</option>
                  </select>
                ) : key === "cp" ? (
                  <select
                    name="cp"
                    value={formData.cp}
                    onChange={handleChange}
                  >
                    <option value="0">Typical Angina</option>
                    <option value="1">Atypical Angina</option>
                    <option value="2">Non-anginal Pain</option>
                    <option value="3">Asymptomatic</option>
                  </select>
                ) : (
                  <input
                    type="number"
                    name={key}
                    value={formData[key]}
                    onChange={handleChange}
                    step={key === "oldpeak" ? "0.1" : "1"}
                  />
                )}
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="submit-btn"
          >
            {loading
              ? "Analyzing Medical Data..."
              : "Generate Diagnosis"}
          </button>
        </form>

        {result && (
          <div
            className={`result-card ${
              result.prediction === 1 ? "risk" : "safe"
            }`}
          >
            <h2>{result.status} Detected</h2>
            <p className="confidence">
              Confidence Score:{" "}
              {(result.probability * 100).toFixed(2)}%
            </p>
            <p className="message">
              {result.message ||
                "Prediction completed based on clinical data."}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
