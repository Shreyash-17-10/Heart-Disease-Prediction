# Cardio Chart — Heart Disease Prediction System

Full-stack app that predicts heart disease risk from patient vitals, symptoms,
and test results, using an XGBoost model trained on a clinically-structured
dataset (13 features, same schema as the UCI Cleveland Heart Disease set).

## Stack
- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** FastAPI (Python)
- **ML:** XGBoost, scikit-learn, pandas (compared against Logistic Regression & Random Forest)
- **Database:** SQLite by default, swappable to PostgreSQL via `DATABASE_URL`

## Project structure
```
Heart-Disease-Prediction/
├── frontend/          React + Tailwind UI
├── backend/           FastAPI app (app/main.py) + model artifacts
├── ml/                dataset generation, training.py, EDA plots
├── README.md
└── .gitignore
```


## 1. Retrain the model (optional — a trained model is already included)
```bash
cd ml
pip install -r ../backend/requirements.txt
python dataset/generate_dataset.py   # regenerates ml/dataset/heart.csv
python training.py                   # trains LR / RF / XGBoost, saves the best one
```
This writes `heart_model.pkl`, `scaler.pkl`, `metadata.json` and EDA plots to
`ml/dataset/eda_plots/`. Copy the three artifact files into `backend/app/` if
you retrain.

## 2. Run the backend
```bash
cd backend
python -m venv venv && source venv/bin/activate   # optional
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
API docs: http://localhost:8000/docs

To use PostgreSQL instead of SQLite:
```bash
export DATABASE_URL=postgresql://user:password@host:5432/heart_db
```

## 3. Run the frontend
```bash
cd frontend
npm install
cp .env.example .env     # set VITE_API_BASE if backend isn't on localhost:8000
npm run dev
```
App: http://localhost:5173

## Deployment
- **Frontend → Vercel:** import the `frontend/` folder as the project root, set
  `VITE_API_BASE` to your deployed backend URL.
- **Backend → Render:** deploy `backend/` as a Web Service
  (`uvicorn app.main:app --host 0.0.0.0 --port $PORT`), add a managed
  PostgreSQL instance and set `DATABASE_URL`.

## API
| Method | Route            | Description                              |
|--------|------------------|-------------------------------------------|
| POST   | `/api/predict`   | Takes the 13 intake fields, returns prediction, confidence, risk factors |
| GET    | `/api/history`   | Last N predictions stored in the database |
| GET    | `/api/metadata`  | Feature list, model name, evaluation metrics |

## Notes
- The dataset in `ml/dataset/` is synthetically generated (seeded, reproducible)
  using the standard 13-feature Cleveland schema, so the project is fully
  self-contained and doesn't depend on any external download.
- This tool is for educational purposes only and is not a medical device.
