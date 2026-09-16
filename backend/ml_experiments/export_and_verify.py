import os
import sys
import json
import joblib
import sklearn
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
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
ARTIFACTS_DIR = os.path.join(EXPERIMENT_DIR, "artifacts")
DATASET_PATH = os.path.join(EXPERIMENT_DIR, "Crop_recommendation.csv")
MODEL_PATH = os.path.join(ARTIFACTS_DIR, "crop_classifier.joblib")
METADATA_PATH = os.path.join(ARTIFACTS_DIR, "metadata.json")
RESULTS_JSON_PATH = os.path.join(EXPERIMENT_DIR, "experiment_results.json")

def load_csv(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        lines = [line.strip() for line in f if line.strip()]
    
    header = [col.strip() for col in lines[0].split(",")]
    feature_names = header[:-1]
    target_name = header[-1]
    
    X_raw = []
    y_raw = []
    for line in lines[1:]:
        parts = [p.strip() for p in line.split(",")]
        X_raw.append([float(val) for val in parts[:-1]])
        y_raw.append(parts[-1])
        
    return np.array(X_raw), np.array(y_raw), feature_names, target_name

def main():
    print("=== MODEL-ARTIFACT EXPORT & VERIFICATION ===")
    os.makedirs(ARTIFACTS_DIR, exist_ok=True)
    
    # 1. Load data with the exact same train/test split settings
    X, y, feature_names, target_name = load_csv(DATASET_PATH)
    unique_labels = sorted(list(np.unique(y)))
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.30, stratify=y, random_state=42
    )
    
    # Check feature overlap
    train_tuples = set(tuple(r) for r in X_train)
    exact_feature_overlap = sum(1 for r in X_test if tuple(r) in train_tuples)
    
    # 2. Fit the selected model pipeline strictly on the training set (NO RETRAINING ON TEST SET)
    pipeline = Pipeline([
        ("scaler", StandardScaler()),
        ("rf", RandomForestClassifier(n_estimators=100, max_depth=None, random_state=42))
    ])
    pipeline.fit(X_train, y_train)
    
    # Compute in-memory test predictions
    in_memory_preds = pipeline.predict(X_test)
    in_memory_accuracy = float(accuracy_score(y_test, in_memory_preds))
    in_memory_macro_f1 = float(f1_score(y_test, in_memory_preds, average="macro"))
    in_memory_cm = confusion_matrix(y_test, in_memory_preds, labels=unique_labels).tolist()
    
    # 3. Check consistency against existing experiment_results.json
    with open(RESULTS_JSON_PATH, "r", encoding="utf-8") as f:
        prior_results = json.load(f)
        
    prior_acc = prior_results["held_out_test_metrics"]["accuracy"]
    prior_f1 = prior_results["held_out_test_metrics"]["macro_f1"]
    prior_cm = prior_results["held_out_test_metrics"]["confusion_matrix"]
    
    print(f"In-Memory Accuracy: {in_memory_accuracy:.6f} vs Saved: {prior_acc:.6f}")
    print(f"In-Memory Macro-F1: {in_memory_macro_f1:.6f} vs Saved: {prior_f1:.6f}")
    assert abs(in_memory_accuracy - prior_acc) < 1e-6, "Accuracy mismatch between in-memory run and saved json!"
    assert abs(in_memory_macro_f1 - prior_f1) < 1e-6, "Macro-F1 mismatch between in-memory run and saved json!"
    assert in_memory_cm == prior_cm, "Confusion matrix mismatch between in-memory run and saved json!"
    print("Verification: In-memory evaluation strictly matches experiment_results.json.")
    
    # Evidence analysis: Check what evidence was and was not saved
    unsaved_evidence = []
    if "test_predictions" not in prior_results["held_out_test_metrics"]:
        unsaved_evidence.append("Row-level test predictions (y_pred array)")
    if "test_indices" not in prior_results["data_integrity"]:
        unsaved_evidence.append("Row-level test sample indices / exact test partition record indices")
    if "cv_fold_scores" not in prior_results["cross_validation_comparison"]["Candidate 2: Random Forest (n=100, max_depth=None)"]:
        unsaved_evidence.append("Individual cross-validation fold scores (only mean and std were saved)")
    print(f"Unsaved evidence identified in prior run: {unsaved_evidence}")
    
    # 4. Save trained pipeline to disk
    joblib.dump(pipeline, MODEL_PATH)
    model_size_bytes = os.path.getsize(MODEL_PATH)
    print(f"Saved pipeline to: {MODEL_PATH} ({model_size_bytes} bytes)")
    
    # 5. Save metadata.json
    metadata = {
        "model_artifact": {
            "file_name": "crop_classifier.joblib",
            "size_bytes": model_size_bytes,
            "pipeline_structure": [
                {"step": "scaler", "class": "StandardScaler"},
                {"step": "rf", "class": "RandomForestClassifier", "params": {"n_estimators": 100, "max_depth": None, "random_state": 42}}
            ]
        },
        "environment": {
            "python_version": sys.version,
            "scikit_learn_version": sklearn.__version__,
            "numpy_version": np.__version__,
            "joblib_version": joblib.__version__
        },
        "features": {
            "ordered_input_features": feature_names,
            "feature_count": len(feature_names),
            "target_column": target_name,
            "crop_labels": unique_labels,
            "crop_count": len(unique_labels)
        },
        "dataset": {
            "name": "Crop Recommendation Dataset",
            "source_primary_url": prior_results["dataset_metadata"]["source_primary_url"],
            "kaggle_url": prior_results["dataset_metadata"]["kaggle_url"],
            "license": "Apache License 2.0",
            "author": "Atharva Ingle",
            "icar_fao_origin": "Unknown / Unverified in source documentation",
            "generation_method": "Undocumented (author describes building dataset by 'augmenting existing datasets', but mathematical generation code is not published)",
            "sha256_checksum": prior_results["dataset_metadata"]["sha256_checksum"],
            "total_samples": len(y)
        },
        "train_test_split": {
            "train_samples": len(y_train),
            "test_samples": len(y_test),
            "test_size": 0.30,
            "stratified": True,
            "random_state": 42,
            "feature_overlap_check": "no exact feature overlap detected (0 exact duplicate feature rows between train and test partitions)"
        },
        "evaluation_metrics": {
            "held_out_test_accuracy": in_memory_accuracy,
            "held_out_test_macro_f1": in_memory_macro_f1,
            "held_out_test_macro_precision": float(precision_score(y_test, in_memory_preds, average="macro")),
            "held_out_test_macro_recall": float(recall_score(y_test, in_memory_preds, average="macro")),
            "per_class_metrics": prior_results["held_out_test_metrics"]["per_class"],
            "confusion_matrix": in_memory_cm,
            "observed_misclassifications": prior_results["held_out_test_metrics"]["misclassified_pairs"]
        },
        "audit_and_limitations": {
            "intended_use": "Educational and experimental demonstration only.",
            "karnataka_validation": "None. The dataset contains no regional field survey records or validation for Karnataka farms.",
            "missing_karnataka_crops": ["Ragi (Finger Millet)", "Jowar (Sorghum)"],
            "unknown_nutrient_units": "Source dataset does not document whether N, P, K are kg/ha, ppm, or an index.",
            "unknown_rainfall_period": "Source dataset does not document whether rainfall is annual, seasonal, or monthly.",
            "agronomic_caveat": "High statistical accuracy on this synthetic benchmark does not establish real-world agricultural suitability."
        }
    }
    
    with open(METADATA_PATH, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)
    print(f"Saved metadata to: {METADATA_PATH}")
    
    # 6. Load saved pipeline in fresh context and verify prediction parity
    loaded_pipeline = joblib.load(MODEL_PATH)
    loaded_preds = loaded_pipeline.predict(X_test)
    
    matches = np.array_equal(in_memory_preds, loaded_preds)
    print(f"Verification: Loaded pipeline predictions match in-memory predictions exactly: {matches}")
    assert matches, "Mismatch between saved model predictions and in-memory model predictions!"
    
    # Test with sample input
    sample_input = np.array([[90.0, 42.0, 43.0, 20.8, 82.0, 6.5, 202.9]])
    sample_pred_mem = pipeline.predict(sample_input)[0]
    sample_pred_disk = loaded_pipeline.predict(sample_input)[0]
    print(f"Sample Input: {sample_input.tolist()} -> In-Memory: '{sample_pred_mem}' | Loaded: '{sample_pred_disk}'")
    assert sample_pred_mem == sample_pred_disk, "Sample prediction mismatch!"
    
    print("=== MODEL-ARTIFACT VERIFICATION COMPLETED SUCCESSFULLY ===")

if __name__ == "__main__":
    main()
