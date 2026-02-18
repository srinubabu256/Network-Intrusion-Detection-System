import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
import pickle
import os

# Define column names for NSL-KDD
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

def train_system_model():
    print("Loading dataset...")
    # Load the real NSL-KDD dataset
    dataset_base = "../datasets/"
    nsl_path = os.path.join(dataset_base, "NSL_KDD/Train.txt")
    
    if os.path.exists(nsl_path):
        data_path = nsl_path
    elif os.path.exists("datasets/NSL_KDD/Train.txt"): # Fallback if running from root
        data_path = "datasets/NSL_KDD/Train.txt"
    elif os.path.exists("../datasets/kdd_sample.csv"):
        print("Warning: Using small sample dataset!")
        data_path = "../datasets/kdd_sample.csv"
    elif os.path.exists("datasets/kdd_sample.csv"):
        print("Warning: Using small sample dataset!")
        data_path = "datasets/kdd_sample.csv"
    else:
        print("Error: No dataset found!")
        return

    try:
        # Load data
        if "kdd_sample.csv" in data_path:
             data = pd.read_csv(data_path)
             # Adjust columns if necessary for sample
        else:
            data = pd.read_csv(data_path, names=columns)
            
        print(f"Dataset loaded: {data.shape}")

        # Basic preprocessing
        # For simplicity in this demo, we will select a subset of numeric columns + critical categorical ones
        # to ensure the model is robust without being overly complex for the web app to simulate.
        
        # However, to be "full depth", let's try to use most of them.
        # Cat columns: protocol_type, service, flag
        
        le_proto = LabelEncoder()
        le_service = LabelEncoder()
        le_flag = LabelEncoder()
        
        data['protocol_type'] = le_proto.fit_transform(data['protocol_type'])
        data['service'] = le_service.fit_transform(data['service'])
        data['flag'] = le_flag.fit_transform(data['flag'])
        
        # Save encoders
        encoders = {
            'protocol_type': le_proto,
            'service': le_service,
            'flag': le_flag
        }
        
        # Map labels to binary (Normal vs Attack) for the primary classification
        # The user mentioned "Type of Attack", so let's try multi-class if possible.
        # Attack classes
        dos_attacks = ['back', 'land', 'neptune', 'pod', 'smurf', 'teardrop', 'apache2', 'udpstorm', 'processtable', 'worm']
        probe_attacks = ['satan', 'ipsweep', 'nmap', 'portsweep', 'mscan', 'saint']
        r2l_attacks = ['guess_passwd', 'ftp_write', 'imap', 'phf', 'multihop', 'warezmaster', 'warezclient', 'spy', 'xlock', 'xsnoop', 'snmpguess', 'snmpgetattack', 'httptunnel', 'sendmail', 'named']
        u2r_attacks = ['buffer_overflow', 'loadmodule', 'rootkit', 'perl', 'sqlattack', 'xterm', 'ps']
        
        def map_attack(label):
            if label == 'normal':
                return 'Normal'
            if label in dos_attacks:
                return 'DoS'
            if label in probe_attacks:
                return 'Probe'
            if label in r2l_attacks:
                return 'R2L'
            if label in u2r_attacks:
                return 'U2R'
            return 'Other'

        data['attack_class'] = data['label'].apply(map_attack)
        
        # Drop original label and difficulty
        X = data.drop(['label', 'difficulty', 'attack_class'], axis=1)
        y = data['attack_class']
        
        # Encode target
        le_target = LabelEncoder()
        y = le_target.fit_transform(y)
        encoders['target'] = le_target
        
        print("Training Random Forest Classifier on full features...")
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        model = RandomForestClassifier(n_estimators=50, random_state=42, n_jobs=-1)
        model.fit(X_train, y_train)
        
        accuracy = model.score(X_test, y_test)
        print(f"Model Accuracy: {accuracy * 100:.2f}%")
        
        # Save everything
        os.makedirs("model", exist_ok=True)
        with open("model/model_full.pkl", "wb") as f:
            pickle.dump(model, f)
        with open("model/encoders.pkl", "wb") as f:
            pickle.dump(encoders, f)
        with open("model/feature_names.pkl", "wb") as f:
            pickle.dump(list(X.columns), f)
            
        print("Model and Encoders saved.")
        
    except Exception as e:
        print(f"An error occurred: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    train_system_model()
