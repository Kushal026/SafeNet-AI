import sys
import asyncio
sys.path.insert(0, 'backend')
from services.threat_service import scan_url

urls = [
    'http://192.168.1.5/login',
    'https://paypa1.com/verify',
    'https://www.google.com',
    'http://secure-update-free-gift.amazon-login.tk',
]

async def main():
    for url in urls:
        result = await scan_url(url)
        print('URL:', url)
        print('Score:', result.get('trust_score'), 'Status:', result.get('status'))
        print('Indicators:', result.get('risk_indicators'))
        print('Explanation:', result.get('ai_explanation'))
        print('-' * 60)

if __name__ == '__main__':
    asyncio.run(main())
