import os
import joblib
from sklearn.ensemble import RandomForestRegressor
from xgboost import XGBRegressor
from data_preprocessing import preprocess_data

def train_and_save_models():
    # Get preprocessed data
    X_train_scaled, _, y_train, _, scaler, _, targets = preprocess_data()

    # Ensure model directory exists
    os.makedirs("models", exist_ok=True)

    # Train & Save Models
    models = {
        'Cracking Load': RandomForestRegressor(n_estimators=100, random_state=42).fit(X_train_scaled, y_train['Cracking Load']),
        'Ultimate Moment': XGBRegressor(n_estimators=150, learning_rate=0.1).fit(X_train_scaled, y_train['Ultimate Moment']),
        'Ultimate Load': XGBRegressor(n_estimators=150, learning_rate=0.1).fit(X_train_scaled, y_train['Ultimate Load']),
        'Axial Displacement': RandomForestRegressor(n_estimators=100, random_state=42).fit(X_train_scaled, y_train['Axial Displacement'])  # Updated name
    }

    # Save models
    for name, model in models.items():
        joblib.dump(model, os.path.join("models", f"model_{name}.joblib"))
    joblib.dump(scaler, os.path.join("models", "scaler.joblib"))

if __name__ == "__main__":
    train_and_save_models()
