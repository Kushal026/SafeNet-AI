#!/usr/bin/env python3
import os
import csv
import random
import string
import hashlib
from datetime import datetime, timedelta

OUT_DIR = os.path.join(os.path.dirname(__file__), 'expanded')
os.makedirs(OUT_DIR, exist_ok=True)

def rand_domain():
    tlds = ['com','net','org','info']
    names = ['malicious','suspicious','benign','accounts','secure','login','update','service','portal','fake ']
    return f"{random.choice(names)}{random.randint(1,9999)}.{random.choice(tlds)}"

def rand_path():
    parts = ['login','reset','user','auth','home','download','update','secure']
    return '/'+random.choice(parts)+('/'+str(random.randint(1,9999)) if random.random()>0.7 else '')

def gen_phishing(rows=10000):
    path = os.path.join(OUT_DIR, 'phishing_urls.csv')
    with open(path, 'w', newline='', encoding='utf-8') as f:
        w = csv.writer(f)
        w.writerow(['id','url','label','threat_score','first_seen'])
        for i in range(rows):
            domain = rand_domain()
            url = f"http://{domain}{rand_path()}"
            label = 'phishing' if random.random() < 0.5 else 'benign'
            score = round(random.betavariate(2,4) if label=='phishing' else random.betavariate(1,10), 3)
            first_seen = (datetime.now() - timedelta(days=random.randint(0,900))).strftime('%Y-%m-%d')
            w.writerow([i+1, url, label, score, first_seen])
    return path

def gen_passwords(rows=10000):
    path = os.path.join(OUT_DIR, 'passwords.csv')
    with open(path, 'w', newline='', encoding='utf-8') as f:
        w = csv.writer(f)
        w.writerow(['id','password','password_strength','is_compromised','last_seen'])
        for i in range(rows):
            # generate password with some variety
            length = random.randint(6,18)
            chars = string.ascii_letters + string.digits + ("!@#$%&*" if random.random() < 0.4 else "")
            pwd = ''.join(random.choice(chars) for _ in range(length))
            strength = 'strong' if length>=12 and any(c.isdigit() for c in pwd) and any(c in '!@#$%&*' for c in pwd) else ('medium' if length>=8 else 'weak')
            compromised = 'True' if random.random() < 0.15 else 'False'
            last_seen = (datetime.now() - timedelta(days=random.randint(0,2000))).strftime('%Y-%m-%d')
            w.writerow([i+1, pwd, strength, compromised, last_seen])
    return path

def gen_threat_intel(rows=10000):
    path = os.path.join(OUT_DIR, 'threat_intel.csv')
    types = ['ip','domain','hash']
    severities = ['low','medium','high','critical']
    with open(path, 'w', newline='', encoding='utf-8') as f:
        w = csv.writer(f)
        w.writerow(['id','indicator','type','description','severity','first_seen','confidence'])
        for i in range(rows):
            t = random.choice(types)
            if t=='ip':
                indicator = f"{random.randint(1,254)}.{random.randint(0,255)}.{random.randint(0,255)}.{random.randint(1,254)}"
            elif t=='domain':
                indicator = rand_domain()
            else:
                indicator = hashlib.sha256(str(random.random()).encode()).hexdigest()[:32]
            severity = random.choices(severities, weights=[50,30,15,5])[0]
            first_seen = (datetime.now() - timedelta(days=random.randint(0,2000))).strftime('%Y-%m-%d')
            confidence = round(random.uniform(0.4,0.99), 2)
            desc = 'Auto-generated indicator'
            w.writerow([i+1, indicator, t, desc, severity, first_seen, confidence])
    return path

def gen_url_scans(rows=10000):
    path = os.path.join(OUT_DIR, 'url_scan_results.csv')
    sources = ['virustotal','internal_scan','external_api']
    families = ['Emotet','TrickBot','None','Locky','Unknown']
    with open(path, 'w', newline='', encoding='utf-8') as f:
        w = csv.writer(f)
        w.writerow(['id','url','scan_date','malicious','malware_family','source','confidence'])
        for i in range(rows):
            url = f"http://{rand_domain()}{rand_path()}"
            malicious = random.random() < 0.12
            family = random.choice(families) if malicious else ''
            source = random.choice(sources)
            scan_date = (datetime.now() - timedelta(days=random.randint(0,1000))).strftime('%Y-%m-%d')
            confidence = round(random.uniform(0.5,0.99) if malicious else random.uniform(0.0,0.6), 2)
            w.writerow([i+1, url, scan_date, str(malicious), family, source, confidence])
    return path

def gen_app_permissions(rows=10000):
    path = os.path.join(OUT_DIR, 'app_permissions.csv')
    perms = ['INTERNET','READ_CONTACTS','ACCESS_FINE_LOCATION','CAMERA','RECORD_AUDIO','READ_SMS']
    ptypes = ['normal','dangerous','signature']
    with open(path, 'w', newline='', encoding='utf-8') as f:
        w = csv.writer(f)
        w.writerow(['id','app','permission','granted','permission_type','requested_date','app_version'])
        for i in range(rows):
            app = f"com.example.app{random.randint(1,5000)}"
            permission = random.choice(perms)
            granted = random.random() < 0.7
            ptype = random.choice(ptypes)
            requested_date = (datetime.now() - timedelta(days=random.randint(0,2000))).strftime('%Y-%m-%d')
            version = f"{random.randint(1,4)}.{random.randint(0,12)}.{random.randint(0,99)}"
            w.writerow([i+1, app, permission, str(granted), ptype, requested_date, version])
    return path

if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser(description='Generate synthetic CSV datasets for SafeNet-AI')
    parser.add_argument('--rows', type=int, default=10000, help='Number of rows per file')
    args = parser.parse_args()
    rows = args.rows
    print('Generating datasets in', OUT_DIR)
    paths = []
    paths.append(gen_phishing(rows))
    paths.append(gen_passwords(rows))
    paths.append(gen_threat_intel(rows))
    paths.append(gen_url_scans(rows))
    paths.append(gen_app_permissions(rows))
    print('Created:')
    for p in paths:
        print(' -', p)
