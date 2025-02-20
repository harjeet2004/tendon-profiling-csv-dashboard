import os
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

def preprocess_data():
    # Load data from the data directory
    data_path = os.path.join("data", "synthetic_beam_dataset.csv")
    df = pd.read_csv(data_path)
    
    # Handle missing values
    df['flange_width'] = df['flange_width'].fillna(0)
    df['flange_height'] = df['flange_height'].fillna(0)
    df['bond_condition'] = df['bond_condition'].map({'B': 1, 'U': 0, 'N/A': 0})

    # Feature Engineering
    df['height_to_width_ratio'] = df['beam_height'] / df['beam_width']
    df['reinforcement_ratio'] = df['area_of_steel_reinforcement'] / (df['beam_width'] * df['beam_height'])

    # Define Features & Targets
    features = ['beam_width', 'beam_height', 'beam_length', 'flange_width', 'flange_height', 'web_thickness', 
                'concrete_compressive_strength', 'concrete_modulus_of_elasticity', 'yield_strength_of_reinforcement', 
                'prestressing_strength', 'steel_modulus_of_elasticity', 'area_of_steel_reinforcement', 
                'area_of_prime_reinforcement', 'area_of_prestressing_reinforcement', 'number_of_strands', 
                'axial_load', 'bond_condition', 'height_to_width_ratio', 'reinforcement_ratio']
    targets = ['Cracking Load', 'Ultimate Moment', 'Ultimate Load', 'Axial Displacement']  # Updated names

    X = df[features]
    y = df[targets]

    # Split & Scale Data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    return X_train_scaled, X_test_scaled, y_train, y_test, scaler, features, targets
