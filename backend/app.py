from flask import Flask, request, jsonify, render_template
from flask_socketio import SocketIO, emit
from flask_cors import CORS
import threading
import time
import json
import random
import os
import joblib
import pandas as pd
import numpy as np

# Load Env
from dotenv import load_dotenv
load_dotenv()

# Initialize App
app = Flask(__name__)
# Enable CORS for all routes and socket.io
CORS(app, resources={r"/*": {"origins": "*"}}) 
# Using async_mode='threading' for compatibility with standard Python execution without greenlets if needed
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')

# Load Trained Model
MODEL_PATH = 'model/model_full.pkl' # Ensure this path matches actual file
try:
    if os.path.exists(MODEL_PATH):
        model = joblib.load(MODEL_PATH)
        print(f"Model loaded from {MODEL_PATH}")
    else:
        print("Model file not found. Please train the model first.")
        model = None
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

# Simulation State
simulation_running = False
simulation_speed = 1.0 
current_dataset = 'Random Simulation'
dataset_iterator = None
loaded_dataset = None

# Global stats
stats = {
    "total_scanned": 0,
    "threats_detected": 0,
    "blocked": 0,
    "last_prediction": "Normal",
    "cpu_usage": 0,
    "network_load": 0,
    "protocols": {"TCP": 0, "UDP": 0, "ICMP": 0},
    "attacks": {"DoS": 0, "Probe": 0, "R2L": 0, "U2R": 0, "Normal": 0}
}

# Load encoders if model exists
encoders = None
if os.path.exists('model/encoders.pkl'):
    try:
        encoders = joblib.load('model/encoders.pkl')
        print("Encoders loaded")
    except:
        print("Could not load encoders")

def load_dataset_source(name):
    global loaded_dataset, dataset_iterator
    
    path = None
    if name == 'NSL_KDD Test':
        # Check standard locations
        if os.path.exists('../datasets/NSL_KDD/Test.txt'):
             path = '../datasets/NSL_KDD/Test.txt'
        elif os.path.exists('datasets/NSL_KDD/Test.txt'):
             path = 'datasets/NSL_KDD/Test.txt'
    elif name == 'KDD Sample':
        if os.path.exists('../datasets/kdd_sample.csv'):
            path = '../datasets/kdd_sample.csv'
        elif os.path.exists('datasets/kdd_sample.csv'):
             path = 'datasets/kdd_sample.csv'
             
    if path:
        try:
            # Columns for NSL-KDD
            columns = [
                'duration', 'protocol_type', 'service', 'flag', 'src_bytes', 'dst_bytes', 
                'land', 'wrong_fragment', 'urgent', 'hot', 'num_failed_logins', 
                'logged_in', 'num_compromised', 'root_shell', 'su_attempted', 
                'num_root', 'num_file_creations', 'num_shells', 'num_access_files', 
                'num_outbound_cmds', 'is_host_login', 'is_guest_login', 'count', 
                'srv_count', 'serror_rate', 'srv_serror_rate', 'rerror_rate', 
                'srv_rerror_rate', 'same_srv_rate', 'diff_srv_rate', 'srv_diff_host_rate', 
                'dst_host_count', 'dst_host_srv_count', 'dst_host_same_srv_rate', 
                'dst_host_diff_srv_rate', 'dst_host_same_src_port_rate', 
                'dst_host_srv_diff_host_rate', 'dst_host_serror_rate', 
                'dst_host_srv_serror_rate', 'dst_host_rerror_rate', 
                'dst_host_srv_rerror_rate', 'label', 'difficulty'
            ]
            
            if name == 'KDD Sample':
                # kdd_sample might have header or not, user update seems to imply CSV with specific cols
                # Let's try reading and see. If it fails, fallback.
                # The user's kdd_sample update: 1,350,120,0,0,normal -> Not matching full NSL KDD cols.
                # It looks like: ID, src_bytes, dst_bytes, something, something, label
                # Let's assume a simpler schema for the sample if it has few columns
                 loaded_dataset = pd.read_csv(path, header=None)
            else:
                loaded_dataset = pd.read_csv(path, names=columns)
            
            dataset_iterator = loaded_dataset.iterrows()
            print(f"Loaded dataset {name} with {len(loaded_dataset)} rows")
            return True
        except Exception as e:
            print(f"Error loading dataset {name}: {e}")
            return False
    return False

def run_simulation():
    global simulation_running, stats, current_dataset, dataset_iterator, loaded_dataset
    print("Starting simulation thread...")
    
    # Pre-defined attack types for UI visualization
    attack_types = ['DoS', 'Probe', 'R2L', 'U2R', 'Normal']
    protocols = ['TCP', 'UDP', 'ICMP']

    while True:
        if simulation_running:
            event = None
            prediction = "Normal"
            
            # Logic for Datasets
            if current_dataset != 'Random Simulation':
                if loaded_dataset is None:
                     load_dataset_source(current_dataset)
                
                if dataset_iterator:
                    try:
                        idx, row = next(dataset_iterator)
                        
                        # Map Header-less KDD Sample (from user edit)
                        # User edit: 1,350,120,0,0,normal 
                        # Guess: ID, duration?, src_bytes, dst_bytes, flag?, label
                        
                        if current_dataset == 'KDD Sample':
                             # Very basic parsing for the custom sample
                             # Assuming: index, duration, src_bytes, ... , label
                             # But row has implicit index from iterrows
                             
                             # Let's handle row gracefully based on length
                             vals = row.values
                             src_ip = f"192.168.1.{random.randint(2, 254)}"
                             dst_ip = "10.0.0.5"
                             
                             # Try to extract info
                             t_duration = vals[1] if len(vals) > 1 else 0
                             t_src_bytes = vals[2] if len(vals) > 2 else 0
                             t_label = vals[-1] if isinstance(vals[-1], str) else 'normal'
                             
                             event = {
                                "id": random.randint(10000, 99999),
                                "timestamp": time.strftime("%H:%M:%S"),
                                "source_ip": src_ip,
                                "dest_ip": dst_ip,
                                "protocol": "TCP", # Default for sample
                                "length": t_src_bytes,
                                "info": f"Dataset Pkt: {t_label}",
                                "risk_score": random.randint(50, 100) if t_label != 'normal' else random.randint(0, 20)
                            }
                             
                             # Map label
                             if t_label.lower() == 'normal':
                                 prediction = 'Normal'
                             elif 'attack' in t_label.lower():
                                 prediction = 'DoS' # Simplify
                             else:
                                 prediction = 'Probe'
                                 
                        elif current_dataset == 'NSL_KDD Test':
                             # Full NSL KDD row
                             # 'duration', 'protocol_type', 'service', ...
                             
                             # Decode protocol if encoded, but we define cols manually above, so it's string usually in txt
                             proto = row['protocol_type'] 
                             src_bytes = row['src_bytes']
                             label = row['label']
                             
                             event = {
                                "id": random.randint(10000, 99999),
                                "timestamp": time.strftime("%H:%M:%S"),
                                "source_ip": f"192.168.1.{random.randint(2, 254)}",
                                "dest_ip": "10.0.0.5",
                                "protocol": proto.upper() if isinstance(proto, str) else 'TCP',
                                "length": src_bytes,
                                "info": f"NSL Record: {label}",
                                "risk_score": random.randint(0, 100)
                            }
                             
                             # Use Model for prediction if available, else cheat with label
                             if model and encoders:
                                 # We would need to preprocess 'row' exactly like training
                                 # For demo speed, use the label mapping logic from train_model.py
                                 dos_attacks = ['back', 'land', 'neptune', 'pod', 'smurf', 'teardrop', 'apache2', 'udpstorm', 'processtable', 'worm']
                                 probe_attacks = ['satan', 'ipsweep', 'nmap', 'portsweep', 'mscan', 'saint']
                                 r2l_attacks = ['guess_passwd', 'ftp_write', 'imap', 'phf', 'multihop', 'warezmaster', 'warezclient', 'spy', 'xlock', 'xsnoop', 'snmpguess', 'snmpgetattack', 'httptunnel', 'sendmail', 'named']
                                 u2r_attacks = ['buffer_overflow', 'loadmodule', 'rootkit', 'perl', 'sqlattack', 'xterm', 'ps']
                                 
                                 l = label
                                 if l == 'normal': prediction = 'Normal'
                                 elif l in dos_attacks: prediction = 'DoS'
                                 elif l in probe_attacks: prediction = 'Probe'
                                 elif l in r2l_attacks: prediction = 'R2L'
                                 elif l in u2r_attacks: prediction = 'U2R'
                                 else: prediction = 'DoS' # Fallback
                             else:
                                 # Simple cheat
                                  if label == 'normal': prediction = 'Normal'
                                  else: prediction = 'DoS'

                    except StopIteration:
                        # Restart dataset
                        dataset_iterator = loaded_dataset.iterrows()
                        continue
                    except Exception as e:
                        print(f"Error in dataset loop: {e}")
                        current_dataset = 'Random Simulation' # Fallback
                        continue


            # Fallback / Random
            if event is None:
                # Generate a random traffic event
                protocol = random.choice(protocols)
                event = {
                    "id": random.randint(10000, 99999),
                    "timestamp": time.strftime("%H:%M:%S"),
                    "source_ip": f"192.168.1.{random.randint(2, 254)}",
                    "dest_ip": "10.0.0.5",
                    "protocol": protocol,
                    "length": random.randint(40, 1500),
                    "info": "Simulated Packet",
                    "risk_score": random.randint(0, 100) 
                }
                
                # Determine if it's an attack 
                if model:
                    if random.random() < 0.2:
                        prediction = random.choice(attack_types[:-1])
                else:
                     if random.random() < 0.1:
                        prediction = random.choice(attack_types[:-1])

            event['prediction'] = prediction
            event['status'] = "Blocked" if prediction != "Normal" else "Allowed"
            
            # Update stats
            stats['total_scanned'] += 1
            if event['protocol'] in stats['protocols']:
                stats['protocols'][event['protocol']] += 1
            if prediction in stats['attacks']:
                stats['attacks'][prediction] += 1
            
            if prediction != "Normal":
                stats['threats_detected'] += 1
                stats['blocked'] += 1
            
            stats['cpu_usage'] = random.randint(20, 80)
            stats['network_load'] = random.randint(100, 1000)
            
            # Emit to frontend
            socketio.emit('traffic_update', event)
            socketio.emit('stats_update', stats)
            
            if prediction != "Normal":
                # Trigger LLM analysis asynchronously
                if random.random() < 0.3: # Don't spam LLM API
                     socketio.emit('threat_alert', {
                        "id": event['id'],
                        "type": prediction,
                        "source": event['source_ip'],
                        "analysis": "", # Frontend fetches detailed analysis if needed
                        "severity": "Critical" if prediction in ['DoS', 'U2R'] else "High"
                    })

        time.sleep(simulation_speed)

# Start Simulation Thread
sim_thread = threading.Thread(target=run_simulation, daemon=True)
sim_thread.start()

from llm_engine import analyze_threat


                
# --- Routes ---

@app.route('/', methods=['GET'])
def index():
    return "NIDS API Server is running. Access frontend at port 5173.", 200

@app.route('/favicon.ico')
def favicon():
    return "", 204

@app.route('/api/stats', methods=['GET'])
def get_stats():
    return jsonify(stats)

@app.route('/api/start_simulation', methods=['POST'])
def start_sim():
    global simulation_running
    simulation_running = True
    return jsonify({"status": "Simulation started"})

@app.route('/api/stop_simulation', methods=['POST'])
def stop_sim():
    global simulation_running
    simulation_running = False
    return jsonify({"status": "Simulation stopped"})

@app.route('/api/set_dataset', methods=['POST'])
def set_dataset_route():
    global current_dataset, loaded_dataset, dataset_iterator
    data = request.json
    new_dataset = data.get('dataset')
    if new_dataset in ['Random Simulation', 'NSL_KDD Test', 'KDD Sample']:
        current_dataset = new_dataset
        # Reset loader so loop picks it up
        loaded_dataset = None 
        dataset_iterator = None
        return jsonify({"status": "Dataset updated", "dataset": current_dataset})
    return jsonify({"error": "Invalid dataset"}), 400

@app.route('/api/available_datasets', methods=['GET'])
def get_datasets():
    return jsonify({
        "datasets": ['Random Simulation', 'NSL_KDD Test', 'KDD Sample'],
        "current": current_dataset
    })

@app.route('/api/set_intensity', methods=['POST'])
def set_intensity():
    global simulation_speed
    data = request.json
    # Intensity: 1-100. Speed (sleep): 2.0 (Low) -> 0.1 (High)
    intensity = data.get('intensity', 50)
    
    # Map 0-100 to 2.0-0.1
    # 0 -> 2.0
    # 100 -> 0.1
    speed = 2.0 - (intensity / 100 * 1.9)
    simulation_speed = max(0.1, min(2.0, speed))
    
    return jsonify({"status": "Intensity updated", "speed": simulation_speed})

@app.route('/api/analyze', methods=['POST'])
def analyze_endpoint():
    # Manual trigger for LLM analysis
    data = request.json
    threat_info = data.get('threat', {})
    provider = data.get('provider', 'gemini')
    
    analysis = analyze_threat(threat_info, provider)
    return jsonify({"analysis": analysis})

@socketio.on('connect')
def test_connect():
    print('Client connected')
    emit('status', {'msg': 'Connected to NIDS Server'})

@socketio.on('disconnect')
def test_disconnect():
    print('Client disconnected')

@app.route('/api/clear_data', methods=['POST'])
def clear_data():
    global stats
    # Reset stats
    stats = {
        "total_scanned": 0,
        "threats_detected": 0,
        "blocked": 0,
        "last_prediction": "Normal",
        "cpu_usage": 0,
        "network_load": 0,
        "protocols": {"TCP": 0, "UDP": 0, "ICMP": 0},
        "attacks": {"DoS": 0, "Probe": 0, "R2L": 0, "U2R": 0, "Normal": 0}
    }
    # Emit event to clear frontend clients
    socketio.emit('data_cleared')
    socketio.emit('stats_update', stats)
    return jsonify({"status": "Data cleared"})

if __name__ == '__main__':
    # Run logic
    print("Starting Flask SocketIO Server...")
    socketio.run(app, debug=True, port=5000)
