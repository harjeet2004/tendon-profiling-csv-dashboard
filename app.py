import os
import pandas as pd
import joblib
from flask import Flask, request, send_file, render_template

# Initialize Flask App
app = Flask(__name__)

# Load Models & Scaler
models = {
    "Cracking Load": joblib.load(os.path.join("models", "model_Cracking Load.joblib")),
    "Ultimate Moment": joblib.load(os.path.join("models", "model_Ultimate Moment.joblib")),
    "Ultimate Load": joblib.load(os.path.join("models", "model_Ultimate Load.joblib")),
    "Axial Displacement": joblib.load(os.path.join("models", "model_Axial Displacement.joblib")),
    "scaler": joblib.load(os.path.join("models", "scaler.joblib"))
}

# Define Required Columns
INPUT_COLUMNS = ['beam_width', 'beam_height', 'beam_length', 'flange_width', 'flange_height', 'web_thickness', 
                 'concrete_compressive_strength', 'concrete_modulus_of_elasticity', 'yield_strength_of_reinforcement', 
                 'prestressing_strength', 'steel_modulus_of_elasticity', 'area_of_steel_reinforcement', 
                 'area_of_prime_reinforcement', 'area_of_prestressing_reinforcement', 'number_of_strands', 
                 'axial_load', 'bond_condition']

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/upload", methods=["POST"])
def upload_file():
    if "file" not in request.files:
        return "No file uploaded", 400

    file = request.files["file"]
    if file.filename == "":
        return "No selected file", 400

    # Read CSV
    input_df = pd.read_csv(file)

    # Validate Columns
    missing_columns = [col for col in INPUT_COLUMNS if col not in input_df.columns]
    if missing_columns:
        return f"Uploaded CSV is missing required columns: {missing_columns}", 400

    # ✅ Feature Engineering
    input_df["height_to_width_ratio"] = input_df["beam_height"] / input_df["beam_width"]  # Height-to-Width Ratio
    input_df["reinforcement_ratio"] = input_df["area_of_steel_reinforcement"] / (input_df["beam_width"] * input_df["beam_height"])  # Reinforcement Ratio

    # ✅ Convert "bond_condition" column from categorical to numerical
    bond_mapping = {"B": 1, "U": 0}
    input_df["bond_condition"] = input_df["bond_condition"].map(bond_mapping).fillna(0)  # Default to 0 if missing

    # Ensure all features match training data
    expected_features = INPUT_COLUMNS + ["height_to_width_ratio", "reinforcement_ratio"]
    missing_features = [col for col in expected_features if col not in input_df.columns]
    if missing_features:
        return f"Required feature(s) missing after preprocessing: {missing_features}", 400

    # Scale input data
    input_scaled = models["scaler"].transform(input_df[expected_features])

    # Make Predictions
    predictions = {
        "Cracking Load": models["Cracking Load"].predict(input_scaled),
        "Ultimate Load": models["Ultimate Load"].predict(input_scaled),
        "Ultimate Moment": models["Ultimate Moment"].predict(input_scaled),
        "Axial Displacement": models["Axial Displacement"].predict(input_scaled)  # Updated name
    }

    # Add Predictions to DataFrame
    for key, values in predictions.items():
        input_df[key] = values

    # Save to CSV
    output_file = "predictions.csv"
    input_df.to_csv(output_file, index=False)

    return send_file(output_file, as_attachment=True)

if __name__ == "__main__":
    app.run(debug=True)
