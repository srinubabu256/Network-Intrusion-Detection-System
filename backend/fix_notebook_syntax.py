import json
import os

file_path = r"d:\Acadamic_Projects\two projects\Network Intrusion Detection System\Network-Intrusion-Detection-System-master\Network Intrusion Detection System.ipynb"

try:
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        exit(1)

    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    changed = False
    for cell in data.get('cells', []):
        if cell.get('cell_type') == 'code':
            new_source = []
            for line in cell.get('source', []):
                # Check for magic commands that might cause syntax errors in standard linters
                if line.strip().startswith('%') and not line.strip().startswith('#'):
                    # Comment it out
                    new_source.append('# ' + line)
                    changed = True
                else:
                    new_source.append(line)
            cell['source'] = new_source

    if changed:
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=1)
        print("Successfully fixed notebook syntax issues.")
    else:
        print("No syntax issues found to fix.")

except Exception as e:
    print(f"Error processing notebook: {e}")
