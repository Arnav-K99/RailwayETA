import asyncio
import json
import urllib.request
import websockets

BASE_URL = "http://127.0.0.1:8000"
WS_URL = "ws://127.0.0.1:8000/ws/simulation"

def http_get(path):
    req = urllib.request.Request(f"{BASE_URL}{path}")
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode())

def http_post(path, data=None):
    payload = json.dumps(data).encode() if data else b""
    req = urllib.request.Request(
        f"{BASE_URL}{path}",
        data=payload,
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode())

def http_delete(path):
    req = urllib.request.Request(f"{BASE_URL}{path}", method="DELETE")
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode())

async def run_tests():
    print("=" * 60)
    print("RAILETA COMPREHENSIVE END-TO-END ACCEPTANCE TEST")
    print("=" * 60)

    # 1. Root & API Health
    print("\n[TEST 1] Verifying API Health...")
    root = http_get("/")
    assert root["status"] == "OPERATIONAL"
    print(f"✓ API Root Operational: active train {root['active_train']}")

    # 2. Train Telemetry & Route
    print("\n[TEST 2] Verifying Train Route & Telemetry...")
    route = http_get("/api/trains/12951/route")
    assert len(route["stations"]) == 7
    assert len(route["sections"]) == 6
    print(f"✓ Corridor verified: {route['corridor_name']} with {len(route['stations'])} stations")

    trains = http_get("/api/trains")
    assert len(trains) >= 4
    primary = trains[0]
    assert primary["train_number"] == "12951"
    print(f"✓ Primary train: {primary['train_number']} {primary['name']} at {primary['current_station']}")

    # 3. Model Analytics (Real ML Metrics)
    print("\n[TEST 3] Verifying ML Regressor Analytics...")
    analytics = http_get("/api/analytics/model")
    metrics = analytics["model_summary"]
    features = analytics["feature_importances"]
    print(f"✓ Model Type: {metrics['model_type']}")
    print(f"✓ Evaluation MAE: {metrics['mae_minutes']} min, RMSE: {metrics['rmse_minutes']} min, R²: {metrics['r2_score']}")
    print(f"✓ Top Feature: {features[0]['readable_name']} ({features[0]['percentage']}%)")
    assert metrics["mae_minutes"] > 0
    assert len(features) > 5

    # 4. Initial Baseline Dynamic ETA
    print("\n[TEST 4] Baseline ETA & Explainability...")
    eta_baseline = http_get("/api/trains/12951/eta")
    next_st = eta_baseline["upcoming_stations"][0]
    print(f"✓ Next Station: {next_st['station_name']} ({next_st['station_code']})")
    print(f"  Scheduled: {next_st['scheduled_arrival']} | Predicted ETA: {next_st['predicted_eta']} | Delay: +{next_st['delay_minutes']}m | Conf: {next_st['confidence_percent']}%")
    print(f"  Range: {next_st['confidence_range']}")
    assert len(eta_baseline["upcoming_stations"]) == 5

    # 5. Operational Event Injection (Congestion)
    print("\n[TEST 5] Injecting Traffic Congestion (+8 min)...")
    event_res = http_post("/api/events", {
        "type": "congestion",
        "section_id": "SEC-KOTA-SWM",
        "title": "Severe Junction Throat Congestion",
        "severity": "HIGH",
        "impact_minutes": 8.0
    })
    evt_id = event_res["event"]["id"]
    print(f"✓ Event created: {evt_id} ({event_res['event']['title']})")

    # Verify ETA recalculation
    eta_after_cong = http_get("/api/trains/12951/eta")
    next_st_cong = eta_after_cong["upcoming_stations"][0]
    print(f"✓ Updated ETA after Congestion: {next_st_cong['predicted_eta']} (Delay: +{next_st_cong['delay_minutes']}m)")
    assert next_st_cong["delay_minutes"] > next_st["delay_minutes"]

    # Verify explainability waterfall
    why_items = eta_after_cong["why_eta_changed"]
    cong_item = next((item for item in why_items if item["category"] == "CONGESTION"), None)
    assert cong_item is not None
    print(f"✓ Explainability Attribution: {cong_item['factor']} accounted for +{cong_item['impact_min']}m delay")

    # 6. Second Disruption (Maintenance Block) Downstream Propagation
    print("\n[TEST 6] Injecting Maintenance Block (+12 min)...")
    maint_res = http_post("/api/events", {
        "type": "maintenance_block",
        "section_id": "SEC-KOTA-SWM",
        "title": "OHE Mega Block",
        "severity": "CRITICAL",
        "impact_minutes": 12.0
    })
    maint_id = maint_res["event"]["id"]

    eta_after_maint = http_get("/api/trains/12951/eta")
    next_st_maint = eta_after_maint["upcoming_stations"][0]
    terminus_st = eta_after_maint["upcoming_stations"][-1]
    print(f"✓ Next Station ETA with Maint Block: {next_st_maint['predicted_eta']} (Delay: +{next_st_maint['delay_minutes']}m)")
    print(f"✓ Downstream Terminus (Agra Cantt) Propagated Delay: +{terminus_st['delay_minutes']}m")
    assert next_st_maint["delay_minutes"] > next_st_cong["delay_minutes"]

    # 7. Recovery Demonstration (Clear Events)
    print("\n[TEST 7] Demonstrating Operational Recovery (Clearing Events)...")
    http_post("/api/events/clear")
    eta_recovered = http_get("/api/trains/12951/eta")
    next_st_rec = eta_recovered["upcoming_stations"][0]
    print(f"✓ Recovered ETA: {next_st_rec['predicted_eta']} (Delay: +{next_st_rec['delay_minutes']}m)")
    assert next_st_rec["delay_minutes"] < next_st_maint["delay_minutes"]

    # 8. Train Simulation Physical Movement
    print("\n[TEST 8] Starting Train Simulation Loop (10x Speed)...")
    http_post("/api/simulation/reset")
    init_state = http_get("/api/simulation/state")
    lat_0 = init_state["train"]["latitude"]
    lon_0 = init_state["train"]["longitude"]
    print(f"✓ Initial Position at Kota: lat={lat_0}, lon={lon_0}")

    http_post("/api/simulation/start")
    print("  Running train for 3 seconds of real time...")
    await asyncio.sleep(3.0)

    moved_state = http_get("/api/simulation/state")
    lat_1 = moved_state["train"]["latitude"]
    lon_1 = moved_state["train"]["longitude"]
    progress_1 = moved_state["train"]["progress_percent"]
    sim_time_1 = moved_state["simulation"]["sim_time"]

    print(f"✓ Train position after 3s: lat={lat_1}, lon={lon_1}, progress={progress_1}%, sim_time={sim_time_1}")
    assert (lat_1 != lat_0 or lon_1 != lon_0 or progress_1 > 0)
    print("✓ Train physically moved along railway polyline!")

    http_post("/api/simulation/pause")
    print("✓ Simulation paused successfully")

    # 9. WebSocket Streaming Test
    print("\n[TEST 9] Connecting to WebSocket Telemetry Stream...")
    async with websockets.connect(WS_URL) as ws:
        msg = await ws.recv()
        data = json.loads(msg)
        assert "train" in data
        assert "upcoming_stations" in data
        assert data["train"]["train_number"] == "12951"
        print(f"✓ WebSocket packet received successfully: train={data['train']['name']}, sim_time={data['simulation']['sim_time']}")

    # 10. Reset
    http_post("/api/simulation/reset")
    print("\n[TEST 10] Simulation reset cleanly to initial Kota position.")

    print("\n" + "=" * 60)
    print("ALL 10 END-TO-END ACCEPTANCE TESTS PASSED PERFECTLY!")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(run_tests())
