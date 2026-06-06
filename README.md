# NIDS Sentinel - Network Intrusion Detection System

A modern web-based Network Intrusion Detection System using machine learning to classify network traffic as normal or attack. Built with React, FastAPI, and scikit-learn.

## Features

- **Dual ML Models**: Random Forest and SVM classifiers trained on NSL-KDD dataset
- **CSV Upload**: Drag-and-drop or click to upload network traffic data
- **Real-time Analysis**: Instant prediction results with model comparison
- **Detailed Metrics**: Accuracy, precision, recall, and confusion matrix for both models
- **Modern UI**: Dark theme with glassmorphism effects and smooth animations
- **Model Comparison**: View predictions from both models with consensus results

## Tech Stack

### Backend
- FastAPI (Python web framework)
- scikit-learn (ML models: Random Forest, SVM)
- pandas & numpy (data processing)
- MongoDB (optional data storage)
- joblib (model serialization)

### Frontend
- React 19
- React Router (navigation)
- Framer Motion (animations)
- Tailwind CSS (styling)
- Lucide React (icons)
- Axios (API calls)

## Project Structure

```
/app/
├── backend/
│   ├── server.py              # FastAPI server with prediction endpoints
│   ├── train_model.py         # ML model training script
│   ├── models/                # Trained models directory
│   │   ├── random_forest_model.pkl
│   │   ├── svm_model.pkl
│   │   ├── scaler.pkl
│   │   ├── label_encoders.pkl
│   │   └── model_metrics.pkl
│   ├── sample_test_data.csv   # Sample CSV for testing
│   └── requirements.txt       # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── App.js             # Main React component with routing
│   │   ├── index.css          # Global styles with design tokens
│   │   └── App.css
│   └── package.json           # Node dependencies
└── design_guidelines.json     # UI/UX design specifications
```

## API Endpoints

### GET /api/
Health check endpoint
```bash
curl http://localhost:8001/api/
```

### GET /api/health
Check if models are loaded
```bash
curl http://localhost:8001/api/health
```

### GET /api/metrics
Get model performance metrics
```bash
curl http://localhost:8001/api/metrics
```

### POST /api/predict
Upload CSV file for prediction
```bash
curl -X POST http://localhost:8001/api/predict \
  -F "file=@sample_test_data.csv"
```

## Dataset Format

The system expects CSV files with NSL-KDD formatted network traffic data containing the following columns:

- `duration`, `protocol_type`, `service`, `flag`
- `src_bytes`, `dst_bytes`, `land`, `wrong_fragment`, `urgent`
- `hot`, `num_failed_logins`, `logged_in`, `num_compromised`
- `root_shell`, `su_attempted`, `num_root`, `num_file_creations`
- `num_shells`, `num_access_files`, `num_outbound_cmds`
- `is_host_login`, `is_guest_login`, `count`, `srv_count`
- Various rate metrics (serror_rate, rerror_rate, same_srv_rate, etc.)
- Host-based metrics (dst_host_count, dst_host_srv_count, etc.)

## Model Training

To retrain the models with new data:

```bash
cd /app/backend
python train_model.py
```

This script will:
1. Generate synthetic NSL-KDD dataset (or load your own data)
2. Preprocess data (encoding, normalization)
3. Train Random Forest and SVM models
4. Evaluate performance metrics
5. Save models to the `models/` directory

## Model Performance

Current models achieve:
- **Random Forest**: 100% accuracy, precision, and recall
- **SVM**: 100% accuracy, precision, and recall

*Note: These metrics are based on synthetic data for demo purposes. Real-world performance may vary.*

## Usage

1. **Upload CSV File**: 
   - Navigate to the homepage
   - Drag and drop your CSV file or click to browse
   - File must be in NSL-KDD format

2. **Analyze Traffic**:
   - Click "Analyze Traffic" button
   - System processes the file and makes predictions

3. **View Results**:
   - See total records processed
   - Compare Random Forest vs SVM predictions
   - Review detailed metrics and confusion matrix
   - Examine individual predictions in the table

4. **New Analysis**:
   - Click "New Analysis" to upload another file

## Design Highlights

- **Dark Theme**: Zinc-950 background with blue accents
- **Typography**: Manrope (headings) + IBM Plex Sans (body) + JetBrains Mono (code)
- **Glassmorphism**: Backdrop blur effects for depth
- **Micro-animations**: Smooth transitions and hover effects
- **Bento Grid Layout**: Modern card-based result display
- **Responsive Design**: Works on desktop and mobile devices

## Sample Test Data

A sample CSV file is provided at `/app/backend/sample_test_data.csv` with:
- 50 total records
- 30 normal traffic samples
- 20 attack traffic samples

## Environment Variables

### Backend (.env)
```
MONGO_URL=mongodb://localhost:27017
DB_NAME=test_database
CORS_ORIGINS=*
```

### Frontend (.env)
```
REACT_APP_BACKEND_URL=https://your-backend-url.com
```

## Development

### Start Backend
```bash
cd /app/backend
uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

### Start Frontend
```bash
cd /app/frontend
yarn start
```

## Academic Use

This project is suitable for:
- Machine learning demonstrations
- Network security coursework
- Cybersecurity research
- Academic presentations
- Portfolio projects

## Future Enhancements

- Real-time packet capture integration
- Support for additional datasets (CICIDS, UNSW-NB15)
- Deep learning models (LSTM, CNN)
- Multi-class attack classification
- Export prediction results to PDF
- Historical analysis tracking
- Model retraining interface

## License

This project is for educational and academic purposes.
