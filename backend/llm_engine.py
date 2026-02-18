import os
import google.generativeai as genai
import openai
from dotenv import load_dotenv

load_dotenv()

# Initialize API Clients
try:
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
except Exception as e:
    print(f"Error configuring Gemini: {e}")

try:
    openai.api_key = os.getenv("OPENAI_API_KEY")
except Exception as e:
    print(f"Error configuring OpenAI: {e}")

def analyze_threat(threat_data, provider="gemini"):
    """
    Analyzes a threat using the specified LLM provider.
    threat_data: Dict containing details like {'type': 'DoS', 'source_ip': '...', 'packet_info': '...'}
    provider: 'gemini' or 'openai'
    """
    prompt = f"""
    Analyze the following network intrusion threat and provide a concise, actionable summary for a security analyst.
    
    Threat Details:
    - Attack Type: {threat_data.get('type', 'Unknown')}
    - Source IP: {threat_data.get('source_ip', 'Unknown')}
    - Packet Info: {threat_data.get('info', 'N/A')}
    - Severity: {threat_data.get('severity', 'High')}
    
    Format the response as JSON with keys:
    - "analysis": Brief explanation of what this attack means.
    - "recommendation": Immediate action items (e.g., Block IP, Reset Firewall).
    - "risk_level": Low, Medium, High, or Critical.
    """

    try:
        if provider.lower() == "gemini":
            model = genai.GenerativeModel('gemini-pro')
            response = model.generate_content(prompt)
            return response.text
        elif provider.lower() == "openai":
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a cybersecurity expert AI."},
                    {"role": "user", "content": prompt}
                ]
            )
            return response.choices[0].message.content
        else:
            return '{"analysis": "Error: Invalid AI Provider selected.", "recommendation": "Check configuration.", "risk_level": "Unknown"}'
    except Exception as e:
        # Fallback for demo purposes if API fails (e.g. invalid key)
        print(f"API Error: {e}")
        return f"""
        {{
            "analysis": "Simulated Analysis: The system detected an anomalous pattern consistent with a {threat_data.get('type', 'potential')} attack. Source IP {threat_data.get('source_ip', 'unknown')} attempted to exploit known vulnerabilities using {threat_data.get('protocol', 'TCP')} traffic. This appears to be a reconnaissance attempt or a denial-of-service precursor.",
            "recommendation": "1. Block Source IP {threat_data.get('source_ip', 'immediately')}\\n2. Update firewall rules to drop packets from this subnet.\\n3. Monitor traffic for similar signatures.",
            "risk_level": "{threat_data.get('severity', 'High')}"
        }}
        """
