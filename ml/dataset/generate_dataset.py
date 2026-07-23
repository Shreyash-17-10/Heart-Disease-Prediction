"""
Generates a synthetic but clinically-plausible heart disease dataset,
following the classic UCI Cleveland Heart Disease schema (14 attributes).

Columns:
age, sex, cp, trestbps, chol, fbs, restecg, thalach, exang, oldpeak, slope, ca, thal, target
"""
import numpy as np
import pandas as pd

np.random.seed(42)
N = 1200

age = np.random.normal(54, 9, N).clip(29, 77).round().astype(int)
sex = np.random.binomial(1, 0.68, N)  # 1 = male, 0 = female
cp = np.random.choice([0, 1, 2, 3], N, p=[0.47, 0.17, 0.28, 0.08])  # chest pain type
trestbps = np.random.normal(131, 17, N).clip(94, 200).round().astype(int)  # resting BP
chol = np.random.normal(246, 51, N).clip(126, 564).round().astype(int)  # cholesterol
fbs = np.random.binomial(1, 0.15, N)  # fasting blood sugar > 120
restecg = np.random.choice([0, 1, 2], N, p=[0.48, 0.5, 0.02])
thalach = np.random.normal(149, 23, N).clip(71, 202).round().astype(int)  # max heart rate
exang = np.random.binomial(1, 0.33, N)  # exercise induced angina
oldpeak = np.random.exponential(1.0, N).clip(0, 6.2).round(1)
slope = np.random.choice([0, 1, 2], N, p=[0.07, 0.46, 0.47])
ca = np.random.choice([0, 1, 2, 3], N, p=[0.58, 0.21, 0.13, 0.08])  # major vessels colored
thal = np.random.choice([1, 2, 3], N, p=[0.06, 0.55, 0.39])

# Rule-based risk score with noise -> label, so the data has real learnable signal
risk = (
    0.035 * (age - 54)
    + 0.9 * sex
    + 0.6 * (cp == 0).astype(int)
    - 0.4 * (cp == 2).astype(int)
    + 0.02 * (trestbps - 131)
    + 0.01 * (chol - 246)
    + 0.5 * fbs
    - 0.03 * (thalach - 149)
    + 1.1 * exang
    + 0.55 * oldpeak
    + 0.5 * (slope == 0).astype(int)
    + 0.7 * ca
    + 0.6 * (thal == 3).astype(int)
    + np.random.normal(0, 1.4, N)
)
target = (risk > np.median(risk)).astype(int)

df = pd.DataFrame({
    "age": age, "sex": sex, "cp": cp, "trestbps": trestbps, "chol": chol,
    "fbs": fbs, "restecg": restecg, "thalach": thalach, "exang": exang,
    "oldpeak": oldpeak, "slope": slope, "ca": ca, "thal": thal, "target": target,
})

# inject a few missing values + duplicates to make the cleaning step in training.py meaningful
missing_idx = np.random.choice(df.index, 15, replace=False)
df.loc[missing_idx, "chol"] = np.nan
df = pd.concat([df, df.sample(10, random_state=1)], ignore_index=True)

df.to_csv("heart.csv", index=False)
print(f"Saved heart.csv with {len(df)} rows (incl. injected nulls/duplicates for cleaning demo)")
