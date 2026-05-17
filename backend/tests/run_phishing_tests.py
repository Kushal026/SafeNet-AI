import sys, json
sys.path.insert(0, 'backend')
from services.ai_analyzer import detect_phishing

cases = [
    {
        'name': 'textual_only_urgency',
        'text': 'Urgent: Your account will be suspended unless you verify now. Click here to confirm.',
        'sender': None,
        'headers': None,
    },
    {
        'name': 'with_suspicious_sender_and_header',
        'text': 'Urgent: Your account will be suspended unless you verify now. Click here http://paypa1-login.com',
        'sender': 'PayPal Support <no-reply@paypa1-login.com>',
        'headers': {'X-Spam-Flag': 'YES', 'Subject': 'URGENT: Verify Your Account'},
    },
    {
        'name': 'brand_lookalike_url_only',
        'text': 'Please login at https://secure-paypal-login.com to continue.',
        'sender': None,
        'headers': None,
    },
    {
        'name': 'benign_message',
        'text': 'Hi team, the meeting is moved to 3pm. Please confirm availability.',
        'sender': 'Alice <alice@example.com>',
        'headers': {'Subject': 'Meeting update'}
    }
]

results = []
for c in cases:
    r = detect_phishing(c['text'], sender=c.get('sender'), headers=c.get('headers'))
    results.append({'case': c['name'], 'result': r})

print(json.dumps(results, indent=2))
