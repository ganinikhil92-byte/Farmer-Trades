import os
import sys
import json
import hashlib
import urllib.request
import numpy as np
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_validate
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.dummy import DummyClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    f1_score,
    precision_score,
    recall_score,
    classification_report,
    confusion_matrix,
)

EXPERIMENT_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_PATH = os.path.join(EXPERIMENT_DIR, "Crop_recommendation.csv")
PRIMARY_URL = "https://raw.githubusercontent.com/atharvaingle/crop-recommendation-dataset/master/Crop_recommendation.csv"
FALLBACK_URL = "https://raw.githubusercontent.com/Gladiator07/Harvestify/master/Data-processed/crop_recommendation.csv"

def compute_sha256(filepath):
    h = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(8192):
            h.update(chunk)
    return h.hexdigest()

def download_dataset():
    if not os.path.exists(DATASET_PATH):
        print(f"Downloading dataset from: {PRIMARY_URL}...")
        try:
            req = urllib.request.Request(PRIMARY_URL, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req) as resp, open(DATASET_PATH, "wb") as f:
                f.write(resp.read())
            print("Download successful from primary URL.")
        except Exception as e:
            print(f"Primary URL failed ({e}). Trying fallback URL: {FALLBACK_URL}...")
            req = urllib.request.Request(FALLBACK_URL, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req) as resp, open(DATASET_PATH, "wb") as f:
                f.write(resp.read())
            print("Download successful from fallback URL.")
    else:
        print(f"Dataset already exists locally at: {DATASET_PATH}")

def load_csv(filepath):
    # Pure Python / NumPy CSV loader (no extra pandas dependency required)
    with open(filepath, "r", encoding="utf-8") as f:
        lines = [line.strip() for line in f if line.strip()]
    
    header = [col.strip() for col in lines[0].split(",")]
    rows = []
    for line in lines[1:]:
        parts = [p.strip() for p in line.split(",")]
        rows.append(parts)
    
    feature_names = header[:-1]
    target_name = header[-1]
    
    X_raw = []
    y_raw = []
    for r in rows:
        X_raw.append([float(val) for val in r[:-1]])
        y_raw.append(r[-1])
        
    return np.array(X_raw), np.array(y_raw), feature_names, target_name

def main():
    print("=== EDUCATIONAL CROP CLASSIFICATION EXPERIMENT ===")
    
    # 1. Dataset provenance & download
    download_dataset()
    sha256_checksum = compute_sha256(DATASET_PATH)
    file_size_bytes = os.path.getsize(DATASET_PATH)
    print(f"File Size: {file_size_bytes} bytes")
    print(f"SHA-256 Checksum: {sha256_checksum}")
    
    # 2. Data loading & inspection
    X, y, feature_names, target_name = load_csv(DATASET_PATH)
    total_samples = len(y)
    unique_labels, label_counts = np.unique(y, return_counts=True)
    num_classes = len(unique_labels)
    
    print(f"Total Samples: {total_samples}")
    print(f"Features ({len(feature_names)}): {feature_names}")
    print(f"Number of Classes: {num_classes}")
    for lbl, cnt in zip(unique_labels, label_counts):
        print(f"  - {lbl}: {cnt} samples")
        
    # 3. Duplicate checks & data integrity
    # Check exact duplicates across features
    feature_tuples = [tuple(row) for row in X]
    unique_feature_set = set()
    duplicate_feature_indices = []
    for i, ft in enumerate(feature_tuples):
        if ft in unique_feature_set:
            duplicate_feature_indices.append(i)
        else:
            unique_feature_set.add(ft)
            
    print(f"\n--- DUPLICATE CHECKS ---")
    print(f"Exact feature duplicates: {len(duplicate_feature_indices)}")
    
    # Check conflicting labels for identical features
    feature_to_labels = {}
    conflicting_features = 0
    for ft, lbl in zip(feature_tuples, y):
        if ft not in feature_to_labels:
            feature_to_labels[ft] = set()
        feature_to_labels[ft].add(lbl)
        if len(feature_to_labels[ft]) > 1:
            conflicting_features += 1
    print(f"Features with conflicting labels: {conflicting_features}")
    
    # 4. Train-Test Split (70% Train, 30% Test, Stratified)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.30, stratify=y, random_state=42
    )
    print(f"\n--- TRAIN / TEST SPLIT ---")
    print(f"Train Set: {len(y_train)} samples ({len(y_train)/total_samples*100:.1f}%)")
    print(f"Test Set:  {len(y_test)} samples ({len(y_test)/total_samples*100:.1f}%)")
    
    # Leakage check: Ensure no identical feature vectors cross the train/test split
    train_feature_set = set(tuple(row) for row in X_train)
    test_leakage_count = sum(1 for row in X_test if tuple(row) in train_feature_set)
    print(f"Train/Test Partition Overlap (Feature Leakage): {test_leakage_count} samples")
    assert test_leakage_count == 0, "Data leakage detected between train and test partitions!"
    
    # 5. Cross-Validation on the Training Set Only (5-Fold Stratified)
    skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    
    models = {
        "Baseline 1: Stratified Dummy": DummyClassifier(strategy="stratified", random_state=42),
        "Baseline 2: Decision Tree (max_depth=5)": Pipeline([
            ("scaler", StandardScaler()),
            ("dt", DecisionTreeClassifier(max_depth=5, random_state=42))
        ]),
        "Candidate 1: Random Forest (n=100, max_depth=10)": Pipeline([
            ("scaler", StandardScaler()),
            ("rf", RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42))
        ]),
        "Candidate 2: Random Forest (n=100, max_depth=None)": Pipeline([
            ("scaler", StandardScaler()),
            ("rf", RandomForestClassifier(n_estimators=100, max_depth=None, random_state=42))
        ])
    }
    
    print(f"\n--- 5-FOLD CROSS-VALIDATION RESULTS (TRAINING SET ONLY) ---")
    cv_results_summary = {}
    for name, model in models.items():
        scores = cross_validate(
            model, X_train, y_train, cv=skf,
            scoring=["accuracy", "f1_macro"],
            return_train_score=False
        )
        mean_acc = np.mean(scores["test_accuracy"])
        std_acc = np.std(scores["test_accuracy"])
        mean_f1 = np.mean(scores["test_f1_macro"])
        std_f1 = np.std(scores["test_f1_macro"])
        cv_results_summary[name] = {
            "cv_mean_accuracy": float(mean_acc),
            "cv_std_accuracy": float(std_acc),
            "cv_mean_macro_f1": float(mean_f1),
            "cv_std_macro_f1": float(std_f1),
        }
        print(f"{name}:")
        print(f"   CV Accuracy: {mean_acc*100:.2f}% (±{std_acc*100:.2f}%)")
        print(f"   CV Macro-F1: {mean_f1*100:.2f}% (±{std_f1*100:.2f}%)")
        
    # Model Selection: Select model with highest mean CV Macro-F1
    best_model_name = max(cv_results_summary, key=lambda k: cv_results_summary[k]["cv_mean_macro_f1"])
    print(f"\nSelected Best Model from Cross-Validation: {best_model_name}")
    
    # 6. Final Evaluation on Held-Out Test Set (Evaluated once after selection)
    selected_pipeline = models[best_model_name]
    selected_pipeline.fit(X_train, y_train)
    y_pred = selected_pipeline.predict(X_test)
    
    test_accuracy = accuracy_score(y_test, y_pred)
    test_macro_f1 = f1_score(y_test, y_pred, average="macro")
    test_macro_prec = precision_score(y_test, y_pred, average="macro")
    test_macro_rec = recall_score(y_test, y_pred, average="macro")
    test_weighted_f1 = f1_score(y_test, y_pred, average="weighted")
    
    print(f"\n--- HELD-OUT TEST SET EVALUATION ({best_model_name}) ---")
    print(f"Overall Accuracy:  {test_accuracy*100:.2f}%")
    print(f"Macro-Averaged F1: {test_macro_f1*100:.2f}%")
    print(f"Macro Precision:   {test_macro_prec*100:.2f}%")
    print(f"Macro Recall:      {test_macro_rec*100:.2f}%")
    print(f"Weighted F1:       {test_weighted_f1*100:.2f}%")
    
    # Per-class report
    clf_report = classification_report(y_test, y_pred, target_names=unique_labels, output_dict=True)
    print(f"\n--- PER-CLASS PERFORMANCE METRICS ---")
    print(f"{'Crop':<15} {'Precision':<12} {'Recall':<12} {'F1-Score':<12} {'Support':<8}")
    print("-" * 59)
    per_class_results = {}
    for crop in unique_labels:
        metrics = clf_report[crop]
        per_class_results[crop] = {
            "precision": float(metrics["precision"]),
            "recall": float(metrics["recall"]),
            "f1_score": float(metrics["f1-score"]),
            "support": int(metrics["support"]),
        }
        print(f"{crop:<15} {metrics['precision']*100:>8.2f}%   {metrics['recall']*100:>8.2f}%   {metrics['f1-score']*100:>8.2f}%   {metrics['support']:>6}")
        
    # Confusion Matrix
    cm = confusion_matrix(y_test, y_pred, labels=unique_labels)
    misclassified_pairs = []
    for i, true_label in enumerate(unique_labels):
        for j, pred_label in enumerate(unique_labels):
            if i != j and cm[i, j] > 0:
                misclassified_pairs.append({
                    "true_crop": true_label,
                    "predicted_as": pred_label,
                    "count": int(cm[i, j])
                })
                
    print(f"\n--- MISCLASSIFICATION PAIRS (CONFUSION ANALYSIS) ---")
    if misclassified_pairs:
        for err in misclassified_pairs:
            print(f"  - Actual '{err['true_crop']}' predicted as '{err['predicted_as']}': {err['count']} times")
    else:
        print("  - Zero misclassifications observed on this held-out test split.")
        
    # Save complete experiment results
    output_summary = {
        "dataset_metadata": {
            "name": "Crop Recommendation Dataset",
            "source_primary_url": PRIMARY_URL,
            "kaggle_url": "https://www.kaggle.com/datasets/atharvaingle/crop-recommendation-dataset",
            "license": "Apache License 2.0 (Verified on Kaggle/GitHub)",
            "author": "Atharva Ingle (Verified)",
            "icar_fao_origin": "Unknown / Unverified in source metadata",
            "sha256_checksum": sha256_checksum,
            "total_samples": int(total_samples),
            "num_features": len(feature_names),
            "feature_names": feature_names,
            "num_classes": int(num_classes),
            "classes": unique_labels.tolist()
        },
        "data_integrity": {
            "exact_feature_duplicates": len(duplicate_feature_indices),
            "conflicting_features": conflicting_features,
            "train_samples": len(y_train),
            "test_samples": len(y_test),
            "train_test_overlap": test_leakage_count
        },
        "cross_validation_comparison": cv_results_summary,
        "selected_model": best_model_name,
        "held_out_test_metrics": {
            "accuracy": float(test_accuracy),
            "macro_f1": float(test_macro_f1),
            "macro_precision": float(test_macro_prec),
            "macro_recall": float(test_macro_rec),
            "weighted_f1": float(test_weighted_f1),
            "per_class": per_class_results,
            "confusion_matrix": cm.tolist(),
            "misclassified_pairs": misclassified_pairs
        },
        "critical_limitations": {
            "nutrient_units": "Unspecified in source dataset (unknown if kg/ha, ppm, or index ratio)",
            "rainfall_period": "Unspecified in source dataset (unknown if annual, seasonal, or monthly)",
            "missing_karnataka_crops": ["Ragi (Finger Millet)", "Jowar (Sorghum)"],
            "regional_validation": "None. Generalized synthetic/augmented data. Not validated on Karnataka or Indian field trials.",
            "agronomic_caveat": "High statistical accuracy on synthetic test split does not establish real-world agronomic suitability."
        }
    }
    
    results_json_path = os.path.join(EXPERIMENT_DIR, "experiment_results.json")
    with open(results_json_path, "w", encoding="utf-8") as f:
        json.dump(output_summary, f, indent=2)
    print(f"\nComplete structured results saved to: {results_json_path}")
    print("=== EXPERIMENT FINISHED SUCCESSFULLY ===")

if __name__ == "__main__":
    main()
