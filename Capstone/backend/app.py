from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import pandas as pd
import numpy as np
import os
import sys 

app = Flask(__name__)

# Enable CORS so your React app (usually on port 3000) can talk to this API
CORS(app)

# Load the saved model and scaler
# Note: Ensure these files are in the same 'app' folder
MODEL_PATH = os.path.join(os.path.dirname(__file__), "heart_model.pkl")
SCALER_PATH = os.path.join(os.path.dirname(__file__), "scaler.pkl")

with open(MODEL_PATH, "rb") as f:
    model = pickle.load(f)

with open(SCALER_PATH, "rb") as f:
    scaler = pickle.load(f)

@app.route("/", methods=["GET"])
def home():
    return jsonify({"status": "Heart Disease API is running"})



@app.route("/predict", methods=["POST"])
def predict():
    print("--- New Prediction Request ---", file=sys.stderr)
    try:
        data = request.get_json()
        
        # This dictionary maps your React keys to the Model's expected keys
        mapping = {
            'age': 'age',
            'sex': 'sex',
            'cp': 'chest_pain_type',
            'trestbps': 'resting_blood_pressure',
            'chol': 'cholesterol',
            'fbs': 'fasting_blood_sugar',
            'restecg': 'resting_ecg',
            'thalach': 'max_heart_rate',
            'exang': 'exercise_induced_angina',
            'oldpeak': 'st_depression',
            'slope': 'st_slope',
            'ca': 'num_major_vessels',
            'thal': 'thalassemia'
        }

        # Reconstruct the data with the CORRECT names in the CORRECT order
        # Ensure this order matches your training columns EXACTLY
        feature_order = [
            'age', 'sex', 'chest_pain_type', 'resting_blood_pressure', 
            'cholesterol', 'fasting_blood_sugar', 'resting_ecg', 
            'max_heart_rate', 'exercise_induced_angina', 'st_depression', 
            'st_slope', 'num_major_vessels', 'thalassemia'
        ]
        
        # Create a list of values based on the mapping and order
        mapped_data = {mapping[k]: v for k, v in data.items()}
        input_df = pd.DataFrame([mapped_data])[feature_order]
        
        # Scale and Predict
        input_scaled = scaler.transform(input_df)
        prediction = model.predict(input_scaled)[0]
        probability = model.predict_proba(input_scaled)[0][1]
        
        return jsonify({
            "prediction": int(prediction),
            "probability": float(probability),
            "status": "High Risk" if prediction == 1 else "Low Risk",
            "message": "Prediction successful"
        })
    except Exception as e:
        print(f"CRITICAL ERROR: {str(e)}", file=sys.stderr)
        return jsonify({"error": str(e)}), 400

if __name__ == "__main__":
    # Running on port 5000 by default
    app.run(host="0.0.0.0", port=5000, debug=True)