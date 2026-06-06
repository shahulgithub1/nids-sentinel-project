import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score, precision_score, recall_score, confusion_matrix, classification_report
import joblib
import os
from pathlib import Path

# Create models directory
MODELS_DIR = Path(__file__).parent / 'models'
MODELS_DIR.mkdir(exist_ok=True)

def load_nsl_kdd_data():
    """
    Load NSL-KDD dataset from local files.
    Expected columns: duration, protocol_type, service, flag, src_bytes, dst_bytes,
    land, wrong_fragment, urgent, hot, num_failed_logins, logged_in, num_compromised,
    root_shell, su_attempted, num_root, num_file_creations, num_shells, num_access_files,
    num_outbound_cmds, is_host_login, is_guest_login, count, srv_count, serror_rate,
    srv_serror_rate, rerror_rate, srv_rerror_rate, same_srv_rate, diff_srv_rate,
    srv_diff_host_rate, dst_host_count, dst_host_srv_count, dst_host_same_srv_rate,
    dst_host_diff_srv_rate, dst_host_same_src_port_rate, dst_host_srv_diff_host_rate,
    dst_host_serror_rate, dst_host_srv_serror_rate, dst_host_rerror_rate,
    dst_host_srv_rerror_rate, label, difficulty
    """
    
    # Define column names for NSL-KDD dataset
    column_names = [
        'duration', 'protocol_type', 'service', 'flag', 'src_bytes', 'dst_bytes',
        'land', 'wrong_fragment', 'urgent', 'hot', 'num_failed_logins', 'logged_in',
        'num_compromised', 'root_shell', 'su_attempted', 'num_root', 'num_file_creations',
        'num_shells', 'num_access_files', 'num_outbound_cmds', 'is_host_login',
        'is_guest_login', 'count', 'srv_count', 'serror_rate', 'srv_serror_rate',
        'rerror_rate', 'srv_rerror_rate', 'same_srv_rate', 'diff_srv_rate',
        'srv_diff_host_rate', 'dst_host_count', 'dst_host_srv_count',
        'dst_host_same_srv_rate', 'dst_host_diff_srv_rate', 'dst_host_same_src_port_rate',
        'dst_host_srv_diff_host_rate', 'dst_host_serror_rate', 'dst_host_srv_serror_rate',
        'dst_host_rerror_rate', 'dst_host_srv_rerror_rate', 'label', 'difficulty'
    ]
    
    # Generate synthetic NSL-KDD-like data for demo purposes
    print("Generating synthetic NSL-KDD dataset for demo...")
    np.random.seed(42)
    n_samples = 5000
    n_normal = int(n_samples * 0.7)
    n_attack = n_samples - n_normal
    
    # Create normal traffic patterns
    normal_data = {
        'duration': np.random.randint(0, 500, n_normal),
        'protocol_type': np.random.choice(['tcp', 'udp'], n_normal, p=[0.8, 0.2]),
        'service': np.random.choice(['http', 'ftp', 'smtp'], n_normal, p=[0.6, 0.2, 0.2]),
        'flag': np.random.choice(['SF', 'S0'], n_normal, p=[0.9, 0.1]),
        'src_bytes': np.random.randint(100, 5000, n_normal),
        'dst_bytes': np.random.randint(100, 5000, n_normal),
        'land': np.zeros(n_normal),
        'wrong_fragment': np.zeros(n_normal),
        'urgent': np.zeros(n_normal),
        'hot': np.random.randint(0, 3, n_normal),
        'num_failed_logins': np.zeros(n_normal),
        'logged_in': np.ones(n_normal),
        'num_compromised': np.zeros(n_normal),
        'root_shell': np.zeros(n_normal),
        'su_attempted': np.zeros(n_normal),
        'num_root': np.zeros(n_normal),
        'num_file_creations': np.random.randint(0, 2, n_normal),
        'num_shells': np.zeros(n_normal),
        'num_access_files': np.random.randint(0, 2, n_normal),
        'num_outbound_cmds': np.zeros(n_normal),
        'is_host_login': np.zeros(n_normal),
        'is_guest_login': np.zeros(n_normal),
        'count': np.random.randint(1, 50, n_normal),
        'srv_count': np.random.randint(1, 50, n_normal),
        'serror_rate': np.random.uniform(0, 0.2, n_normal),
        'srv_serror_rate': np.random.uniform(0, 0.2, n_normal),
        'rerror_rate': np.random.uniform(0, 0.1, n_normal),
        'srv_rerror_rate': np.random.uniform(0, 0.1, n_normal),
        'same_srv_rate': np.random.uniform(0.7, 1.0, n_normal),
        'diff_srv_rate': np.random.uniform(0, 0.3, n_normal),
        'srv_diff_host_rate': np.random.uniform(0, 0.2, n_normal),
        'dst_host_count': np.random.randint(100, 256, n_normal),
        'dst_host_srv_count': np.random.randint(100, 256, n_normal),
        'dst_host_same_srv_rate': np.random.uniform(0.7, 1.0, n_normal),
        'dst_host_diff_srv_rate': np.random.uniform(0, 0.3, n_normal),
        'dst_host_same_src_port_rate': np.random.uniform(0.5, 1.0, n_normal),
        'dst_host_srv_diff_host_rate': np.random.uniform(0, 0.2, n_normal),
        'dst_host_serror_rate': np.random.uniform(0, 0.2, n_normal),
        'dst_host_srv_serror_rate': np.random.uniform(0, 0.2, n_normal),
        'dst_host_rerror_rate': np.random.uniform(0, 0.1, n_normal),
        'dst_host_srv_rerror_rate': np.random.uniform(0, 0.1, n_normal),
        'label': ['normal'] * n_normal
    }
    
    # Create attack traffic patterns (with distinct characteristics)
    attack_data = {
        'duration': np.random.randint(0, 100, n_attack),
        'protocol_type': np.random.choice(['tcp', 'udp', 'icmp'], n_attack, p=[0.5, 0.3, 0.2]),
        'service': np.random.choice(['http', 'ftp', 'telnet', 'ssh'], n_attack, p=[0.4, 0.2, 0.2, 0.2]),
        'flag': np.random.choice(['S0', 'REJ', 'RSTR'], n_attack, p=[0.5, 0.3, 0.2]),
        'src_bytes': np.random.randint(0, 1000, n_attack),
        'dst_bytes': np.random.randint(0, 100, n_attack),
        'land': np.random.randint(0, 2, n_attack),
        'wrong_fragment': np.random.randint(0, 5, n_attack),
        'urgent': np.random.randint(0, 3, n_attack),
        'hot': np.random.randint(5, 20, n_attack),
        'num_failed_logins': np.random.randint(1, 10, n_attack),
        'logged_in': np.zeros(n_attack),
        'num_compromised': np.random.randint(0, 10, n_attack),
        'root_shell': np.random.randint(0, 2, n_attack),
        'su_attempted': np.random.randint(0, 2, n_attack),
        'num_root': np.random.randint(0, 10, n_attack),
        'num_file_creations': np.random.randint(0, 5, n_attack),
        'num_shells': np.random.randint(0, 3, n_attack),
        'num_access_files': np.random.randint(0, 5, n_attack),
        'num_outbound_cmds': np.random.randint(0, 2, n_attack),
        'is_host_login': np.random.randint(0, 2, n_attack),
        'is_guest_login': np.random.randint(0, 2, n_attack),
        'count': np.random.randint(100, 500, n_attack),
        'srv_count': np.random.randint(100, 500, n_attack),
        'serror_rate': np.random.uniform(0.5, 1.0, n_attack),
        'srv_serror_rate': np.random.uniform(0.5, 1.0, n_attack),
        'rerror_rate': np.random.uniform(0.3, 0.9, n_attack),
        'srv_rerror_rate': np.random.uniform(0.3, 0.9, n_attack),
        'same_srv_rate': np.random.uniform(0, 0.3, n_attack),
        'diff_srv_rate': np.random.uniform(0.7, 1.0, n_attack),
        'srv_diff_host_rate': np.random.uniform(0.5, 1.0, n_attack),
        'dst_host_count': np.random.randint(1, 50, n_attack),
        'dst_host_srv_count': np.random.randint(1, 50, n_attack),
        'dst_host_same_srv_rate': np.random.uniform(0, 0.3, n_attack),
        'dst_host_diff_srv_rate': np.random.uniform(0.7, 1.0, n_attack),
        'dst_host_same_src_port_rate': np.random.uniform(0, 0.3, n_attack),
        'dst_host_srv_diff_host_rate': np.random.uniform(0.5, 1.0, n_attack),
        'dst_host_serror_rate': np.random.uniform(0.5, 1.0, n_attack),
        'dst_host_srv_serror_rate': np.random.uniform(0.5, 1.0, n_attack),
        'dst_host_rerror_rate': np.random.uniform(0.3, 0.9, n_attack),
        'dst_host_srv_rerror_rate': np.random.uniform(0.3, 0.9, n_attack),
        'label': ['attack'] * n_attack
    }
    
    # Combine and shuffle
    df_normal = pd.DataFrame(normal_data)
    df_attack = pd.DataFrame(attack_data)
    df = pd.concat([df_normal, df_attack], ignore_index=True)
    df = df.sample(frac=1, random_state=42).reset_index(drop=True)
    
    return df

def preprocess_data(df):
    """
    Preprocess the data: handle missing values, encode categorical variables, normalize.
    """
    print("Preprocessing data...")
    
    # Make a copy to avoid modifying original
    df = df.copy()
    
    # Binary classification: normal vs attack
    df['label'] = df['label'].apply(lambda x: 0 if x == 'normal' else 1)
    
    # Identify categorical columns
    categorical_cols = df.select_dtypes(include=['object']).columns.tolist()
    
    # Label encode categorical features
    label_encoders = {}
    for col in categorical_cols:
        le = LabelEncoder()
        df[col] = le.fit_transform(df[col].astype(str))
        label_encoders[col] = le
    
    # Handle any missing values
    df = df.fillna(0)
    
    # Separate features and target
    X = df.drop('label', axis=1)
    y = df['label']
    
    return X, y, label_encoders

def train_models(X_train, X_test, y_train, y_test):
    """
    Train Random Forest and SVM models.
    """
    print("\nTraining Random Forest...")
    rf_model = RandomForestClassifier(n_estimators=100, random_state=42, max_depth=10, n_jobs=-1)
    rf_model.fit(X_train, y_train)
    rf_pred = rf_model.predict(X_test)
    
    print("Training SVM...")
    svm_model = SVC(kernel='rbf', random_state=42, gamma='scale')
    svm_model.fit(X_train, y_train)
    svm_pred = svm_model.predict(X_test)
    
    return rf_model, rf_pred, svm_model, svm_pred

def evaluate_model(y_test, y_pred, model_name):
    """
    Evaluate model performance.
    """
    print(f"\n{'='*50}")
    print(f"{model_name} Performance")
    print(f"{'='*50}")
    
    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred, average='binary')
    recall = recall_score(y_test, y_pred, average='binary')
    cm = confusion_matrix(y_test, y_pred)
    
    print(f"Accuracy:  {accuracy:.4f}")
    print(f"Precision: {precision:.4f}")
    print(f"Recall:    {recall:.4f}")
    print(f"\nConfusion Matrix:")
    print(cm)
    print(f"\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=['Normal', 'Attack']))
    
    return {
        'accuracy': float(accuracy),
        'precision': float(precision),
        'recall': float(recall),
        'confusion_matrix': cm.tolist()
    }

def main():
    print("NSL-KDD Network Intrusion Detection - Model Training")
    print("="*60)
    
    # Load data
    df = load_nsl_kdd_data()
    print(f"Dataset shape: {df.shape}")
    print(f"\nLabel distribution:")
    print(df['label'].value_counts())
    
    # Preprocess
    X, y, label_encoders = preprocess_data(df)
    print(f"\nFeatures shape: {X.shape}")
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    print(f"Training samples: {X_train.shape[0]}")
    print(f"Testing samples: {X_test.shape[0]}")
    
    # Normalize features
    scaler = StandardScaler()
    X_train = scaler.fit_transform(X_train)
    X_test = scaler.transform(X_test)
    
    # Train models
    rf_model, rf_pred, svm_model, svm_pred = train_models(X_train, X_test, y_train, y_test)
    
    # Evaluate models
    rf_metrics = evaluate_model(y_test, rf_pred, "Random Forest")
    svm_metrics = evaluate_model(y_test, svm_pred, "SVM")
    
    # Save models and preprocessors
    print(f"\nSaving models to {MODELS_DIR}...")
    joblib.dump(rf_model, MODELS_DIR / 'random_forest_model.pkl')
    joblib.dump(svm_model, MODELS_DIR / 'svm_model.pkl')
    joblib.dump(scaler, MODELS_DIR / 'scaler.pkl')
    joblib.dump(label_encoders, MODELS_DIR / 'label_encoders.pkl')
    joblib.dump(X.columns.tolist(), MODELS_DIR / 'feature_columns.pkl')
    
    # Save metrics
    metrics = {
        'random_forest': rf_metrics,
        'svm': svm_metrics
    }
    joblib.dump(metrics, MODELS_DIR / 'model_metrics.pkl')
    
    print("\nModels trained and saved successfully!")
    print(f"Files saved in: {MODELS_DIR}")

if __name__ == '__main__':
    main()
