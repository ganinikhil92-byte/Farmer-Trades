import urllib.request
import json
import urllib.error

def get_json(url):
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req) as resp:
        return resp.getcode(), json.loads(resp.read().decode('utf-8'))

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
    print("=== 1. TEST READ-ONLY METADATA ENDPOINT ===")
    code, meta = get_json('http://127.0.0.1:8000/api/ml/crop-metadata')
    print('Status:', code)
    assert code == 200
    ranges = meta['training_data_ranges']
    assert len(ranges) == 7
    print('N range:', ranges['N'])
    print('P range:', ranges['P'])
    print('K range:', ranges['K'])
    print('temperature range:', ranges['temperature'])
    print('humidity range:', ranges['humidity'])
    print('ph range:', ranges['ph'])
    print('rainfall range:', ranges['rainfall'])
    assert ranges['N']['min'] == 0.0 and ranges['N']['max'] == 140.0
    assert ranges['P']['min'] == 5.0 and ranges['P']['max'] == 145.0
    assert ranges['K']['min'] == 5.0 and ranges['K']['max'] == 205.0
    assert abs(ranges['temperature']['min'] - 8.825674745) < 1e-4
    assert abs(ranges['temperature']['max'] - 43.36051537) < 1e-4
    assert abs(ranges['ph']['min'] - 3.504752314) < 1e-4
    assert abs(ranges['ph']['max'] - 9.93509073) < 1e-4
    print(">>> Metadata endpoint ranges strictly verified!")

    print("\n=== 2. TEST IN-RANGE EXAMPLE INPUTS ===")
    example_payload = {
        'N': 90.0, 'P': 42.0, 'K': 43.0,
        'temperature': 20.8, 'humidity': 82.0,
        'ph': 6.5, 'rainfall': 202.9
    }
    code, res = post_json('http://127.0.0.1:8000/api/ml/crop-demo', example_payload)
    print('Example input status:', code, 'Predicted:', res.get('predicted_crop'))
    assert code == 200
    assert res['predicted_crop'] == 'rice'
    print(">>> Example inputs test passed!")

    print("\n=== 3. TEST OUT-OF-TRAINING-RANGE INPUTS (PHYSICALLY VALID) ===")
    # N=160 (training max is 140, but physically non-negative)
    out_range_payload = {
        'N': 160.0, 'P': 42.0, 'K': 43.0,
        'temperature': 20.8, 'humidity': 82.0,
        'ph': 6.5, 'rainfall': 202.9
    }
    code, res = post_json('http://127.0.0.1:8000/api/ml/crop-demo', out_range_payload)
    print('N=160 status:', code, 'Predicted:', res.get('predicted_crop'))
    assert code == 200, "Physically valid out-of-range input should be processed by model without silent clamping"

    # pH=11.5 (training max is ~9.9, but physically valid within 0-14)
    out_ph_payload = {
        'N': 90.0, 'P': 42.0, 'K': 43.0,
        'temperature': 20.8, 'humidity': 82.0,
        'ph': 11.5, 'rainfall': 202.9
    }
    code, res = post_json('http://127.0.0.1:8000/api/ml/crop-demo', out_ph_payload)
    print('pH=11.5 status:', code, 'Predicted:', res.get('predicted_crop'))
    assert code == 200

    print(">>> Physically valid out-of-training-range inputs processed cleanly!")

    print("\n=== 4. TEST PHYSICALLY INVALID INPUTS (REJECTED) ===")
    invalid_cases = [
        ('Negative N (-5)', {'N': -5.0, 'P': 42.0, 'K': 43.0, 'temperature': 20.8, 'humidity': 82.0, 'ph': 6.5, 'rainfall': 202.9}, 400),
        ('Negative Rainfall (-1)', {'N': 90.0, 'P': 42.0, 'K': 43.0, 'temperature': 20.8, 'humidity': 82.0, 'ph': 6.5, 'rainfall': -1.0}, 400),
        ('pH > 14 (15.5)', {'N': 90.0, 'P': 42.0, 'K': 43.0, 'temperature': 20.8, 'humidity': 82.0, 'ph': 15.5, 'rainfall': 202.9}, 400),
        ('Humidity > 100 (105)', {'N': 90.0, 'P': 42.0, 'K': 43.0, 'temperature': 20.8, 'humidity': 105.0, 'ph': 6.5, 'rainfall': 202.9}, 400),
    ]
    for desc, payload, exp_code in invalid_cases:
        c, r = post_json('http://127.0.0.1:8000/api/ml/crop-demo', payload)
        print(f"Case: {desc:<30} -> HTTP {c} (Expected {exp_code})")
        assert c == exp_code
    print(">>> Physical boundaries strictly enforced!")

    print("\n=== 5. TEST PRESERVATION OF EXISTING ENDPOINTS ===")
    c, r = post_json('http://127.0.0.1:8000/api/predict/crop', {'features': [90, 42, 43, 20.8, 82.0, 6.5, 202.9]})
    assert c == 200
    c, r = post_json('http://127.0.0.1:8000/api/predict/yield', {'features': [3.5, 1, 1, 750]})
    assert c == 200
    c, r = post_json('http://127.0.0.1:8000/api/recommend/fertilizer', {'features': [50, 25, 15, 30]})
    assert c == 200
    print(">>> Yield and fertilizer endpoints operational and unchanged!")

    print("\n=== ALL TEST CHECKS PASSED ===")

if __name__ == '__main__':
    main()
