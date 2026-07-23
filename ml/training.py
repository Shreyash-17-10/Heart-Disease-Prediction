"""
Heart Disease Prediction - Model Training Pipeline
Loads dataset -> cleans -> EDA -> trains LogisticRegression, RandomForest, XGBoost
-> compares -> saves the best model (heart_model.pkl) + scaler + metadata.
"""
import json
import os

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import pandas as pd
import seaborn as sns
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report, roc_auc_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from xgboost import XGBClassifier
import pickle

BASE = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE, "dataset", "heart.csv")
PLOTS_DIR = os.path.join(BASE, "dataset", "eda_plots")
os.makedirs(PLOTS_DIR, exist_ok=True)

FEATURES = ["age", "sex", "cp", "trestbps", "chol", "fbs", "restecg",
            "thalach", "exang", "oldpeak", "slope", "ca", "thal"]
TARGET = "target"

# ---------- 1. Load ----------
df = pd.read_csv(DATA_PATH)
print(f"Loaded {len(df)} rows")

# ---------- 2. Clean ----------
before = len(df)
df = df.drop_duplicates()
df[FEATURES] = df[FEATURES].fillna(df[FEATURES].median(numeric_only=True))
print(f"Cleaned: removed {before - len(df)} duplicate rows, filled missing values with median")

# ---------- 3. EDA ----------
plt.figure(figsize=(6, 4))
sns.countplot(x=TARGET, data=df, palette=["#3f6b5c", "#a8452e"])
plt.title("Target Class Distribution")
plt.xlabel("Heart Disease (0 = No, 1 = Yes)")
plt.tight_layout()
plt.savefig(os.path.join(PLOTS_DIR, "target_distribution.png"), dpi=120)
plt.close()

plt.figure(figsize=(9, 7))
sns.heatmap(df[FEATURES + [TARGET]].corr(), annot=True, fmt=".2f", cmap="viridis")
plt.title("Feature Correlation Heatmap")
plt.tight_layout()
plt.savefig(os.path.join(PLOTS_DIR, "correlation_heatmap.png"), dpi=120)
plt.close()

plt.figure(figsize=(6, 4))
sns.histplot(data=df, x="age", hue=TARGET, kde=True, palette=["#3f6b5c", "#a8452e"])
plt.title("Age Distribution by Diagnosis")
plt.tight_layout()
plt.savefig(os.path.join(PLOTS_DIR, "age_distribution.png"), dpi=120)
plt.close()
print(f"EDA plots saved to {PLOTS_DIR}")

# ---------- 4. Split + scale ----------
X = df[FEATURES]
y = df[TARGET]
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)
scaler = StandardScaler()
X_train_s = scaler.fit_transform(X_train)
X_test_s = scaler.transform(X_test)

# ---------- 5. Train + compare models ----------
models = {
    "Logistic Regression": LogisticRegression(max_iter=1000),
    "Random Forest": RandomForestClassifier(n_estimators=300, max_depth=6, random_state=42),
    "XGBoost": XGBClassifier(
        n_estimators=300, max_depth=4, learning_rate=0.05,
        subsample=0.9, colsample_bytree=0.9,
        eval_metric="logloss", random_state=42
    ),
}

results = {}
for name, model in models.items():
    if name == "Logistic Regression":
        model.fit(X_train_s, y_train)
        preds = model.predict(X_test_s)
        proba = model.predict_proba(X_test_s)[:, 1]
    else:
        model.fit(X_train, y_train)
        preds = model.predict(X_test)
        proba = model.predict_proba(X_test)[:, 1]
    acc = accuracy_score(y_test, preds)
    auc = roc_auc_score(y_test, proba)
    results[name] = {"accuracy": round(acc, 4), "roc_auc": round(auc, 4)}
    print(f"\n{name}: accuracy={acc:.4f}  roc_auc={auc:.4f}")
    print(classification_report(y_test, preds))

# ---------- 6. Pick best (XGBoost, as per project spec) ----------
best_name = "XGBoost"
best_model = models[best_name]
print(f"\nSelected best model: {best_name} -> {results[best_name]}")

# ---------- 7. Save model + scaler + metadata ----------
with open(os.path.join(BASE, "heart_model.pkl"), "wb") as f:
    pickle.dump(best_model, f)
with open(os.path.join(BASE, "scaler.pkl"), "wb") as f:
    pickle.dump(scaler, f)

metadata = {
    "features": FEATURES,
    "model": best_name,
    "results": results,
    "feature_notes": {
        "age": "Age in years",
        "sex": "1 = male, 0 = female",
        "cp": "Chest pain type: 0=typical angina,1=atypical angina,2=non-anginal,3=asymptomatic",
        "trestbps": "Resting blood pressure (mm Hg)",
        "chol": "Serum cholesterol (mg/dl)",
        "fbs": "Fasting blood sugar > 120 mg/dl (1=true, 0=false)",
        "restecg": "Resting ECG results (0,1,2)",
        "thalach": "Max heart rate achieved",
        "exang": "Exercise induced angina (1=yes, 0=no)",
        "oldpeak": "ST depression induced by exercise",
        "slope": "Slope of peak exercise ST segment (0,1,2)",
        "ca": "Number of major vessels colored by fluoroscopy (0-3)",
        "thal": "Thalassemia: 1=fixed defect,2=normal,3=reversible defect",
    },
}
with open(os.path.join(BASE, "metadata.json"), "w") as f:
    json.dump(metadata, f, indent=2)

print("\nSaved heart_model.pkl, scaler.pkl, metadata.json")
