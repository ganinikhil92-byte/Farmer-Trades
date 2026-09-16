import urllib.request
import json
import urllib.error
import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
import joblib
import numpy as np

def post_json(url, payload):
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.getcode(), json.loads(resp.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8')
        try:
            return e.code, json.loads(body)
        except Exception:
            return e.code, body

def main():
    print("=== 1. TEST VALID INPUT & PIPELINE PARITY ===")
    import os
    model_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'artifacts', 'crop_classifier.joblib')
    direct_pipe = joblib.load(model_path)
    vec = [90.0, 42.0, 43.0, 20.8, 82.0, 6.5, 202.9]
    direct_pred = direct_pipe.predict(np.array([vec]))[0]
    print('Direct Pipeline Inference:', direct_pred)

    valid_payload = {'N': 90.0, 'P': 42.0, 'K': 43.0, 'temperature': 20.8, 'humidity': 82.0, 'ph': 6.5, 'rainfall': 202.9}
    code, res = post_json('http://127.0.0.1:8000/api/ml/crop-demo', valid_payload)
    print('API Status:', code)
    print('API Response:', json.dumps(res, indent=2))
    assert code == 200, f"Expected 200, got {code}"
    assert res['predicted_crop'] == direct_pred, f"Prediction mismatch: {res['predicted_crop']} vs {direct_pred}"
    assert res['educational_demo'] is True
    assert 'confidence' not in res, "Confidence score must not be returned!"
    assert 'suitability' not in res, "Farm suitability claim must not be returned!"
    assert len(res['limitations']) >= 3
    print(">>> Valid input test PASSED with exact pipeline parity!")

    print("\n=== 2. TEST NEGATIVE TEMPERATURE VALIDATION ===")
    cold_payload = {'N': 20.0, 'P': 70.0, 'K': 80.0, 'temperature': -2.5, 'humidity': 30.0, 'ph': 6.8, 'rainfall': 50.0}
    code, res = post_json('http://127.0.0.1:8000/api/ml/crop-demo', cold_payload)
    print('Negative temp status:', code, 'Predicted:', res.get('predicted_crop'))
    assert code == 200, f"Expected 200 for valid negative temperature, got {code}"
    print(">>> Negative temperature accepted test PASSED!")

    print("\n=== 3. TEST INVALID INPUTS REJECTION ===")
    invalid_cases = [
        ("Negative N", {'N': -5.0, 'P': 42.0, 'K': 43.0, 'temperature': 20.8, 'humidity': 82.0, 'ph': 6.5, 'rainfall': 202.9}, 400),
        ("Negative Rainfall", {'N': 90.0, 'P': 42.0, 'K': 43.0, 'temperature': 20.8, 'humidity': 82.0, 'ph': 6.5, 'rainfall': -10.0}, 400),
        ("pH > 14", {'N': 90.0, 'P': 42.0, 'K': 43.0, 'temperature': 20.8, 'humidity': 82.0, 'ph': 15.0, 'rainfall': 202.9}, 400),
        ("pH < 0", {'N': 90.0, 'P': 42.0, 'K': 43.0, 'temperature': 20.8, 'humidity': 82.0, 'ph': -0.5, 'rainfall': 202.9}, 400),
        ("Humidity > 100", {'N': 90.0, 'P': 42.0, 'K': 43.0, 'temperature': 20.8, 'humidity': 105.0, 'ph': 6.5, 'rainfall': 202.9}, 400),
        ("Humidity < 0", {'N': 90.0, 'P': 42.0, 'K': 43.0, 'temperature': 20.8, 'humidity': -5.0, 'ph': 6.5, 'rainfall': 202.9}, 400),
        ("Missing Field (no rainfall)", {'N': 90.0, 'P': 42.0, 'K': 43.0, 'temperature': 20.8, 'humidity': 82.0, 'ph': 6.5}, 422),
        ("Non-numeric field (N='abc')", {'N': 'abc', 'P': 42.0, 'K': 43.0, 'temperature': 20.8, 'humidity': 82.0, 'ph': 6.5, 'rainfall': 202.9}, 422),
    ]
    for desc, payload, exp_code in invalid_cases:
        c, r = post_json('http://127.0.0.1:8000/api/ml/crop-demo', payload)
        print(f"Case: {desc:<30} -> HTTP {c} (Expected {exp_code})")
        assert c == exp_code, f"{desc} expected {exp_code}, got {c}"
    print(">>> All invalid input rejection tests PASSED!")

    print("\n=== 4. TEST PRESERVATION OF EXISTING ENDPOINTS ===")
    c, r = post_json('http://127.0.0.1:8000/api/predict/crop', {'features': [90, 42, 43, 20.8, 82.0, 6.5, 202.9]})
    print('Existing /api/predict/crop:', c, r)
    assert c == 200

    c, r = post_json('http://127.0.0.1:8000/api/predict/yield', {'features': [3.5, 1, 1, 750]})
    print('Existing /api/predict/yield:', c, r.get('yield_per_acre'), r.get('total_yield'))
    assert c == 200

    c, r = post_json('http://127.0.0.1:8000/api/recommend/fertilizer', {'features': [50, 25, 15, 30]})
    print('Existing /api/recommend/fertilizer:', c, r.get('recommendation'))
    assert c == 200
    print(">>> All existing endpoints preserved and working!")

    print("\n=== 5. TEST MISSING-MODEL HANDLING UNIT BEHAVIOR ===")
    from routes import load_crop_demo_model, ML_CROP_MODEL_PATH
    import routes
    
    # Simulate missing model behavior
    orig_path = routes.ML_CROP_MODEL_PATH
    routes.ML_CROP_MODEL_PATH = "non_existent_path.joblib"
    routes._crop_model_init_attempted = False
    routes._crop_model_cache = None
    routes._crop_model_error = None
    
    m, v, err = routes.load_crop_demo_model()
    print("Simulated missing model result:", m, v, "Error:", err)
    assert m is None, "Model should be None when path does not exist"
    assert err is not None, "Error should be reported when path does not exist"
    
    # Restore original path and cache
    routes.ML_CROP_MODEL_PATH = orig_path
    routes._crop_model_init_attempted = False
    routes._crop_model_cache = None
    routes._crop_model_error = None
    m, v, err = routes.load_crop_demo_model()
    assert m is not None, "Model should restore cleanly"
    print(">>> Missing model handling test PASSED!")

    print("\n=== ALL TEST CHECKS COMPLETED SUCCESSFULLY ===")

if __name__ == '__main__':
    main()
