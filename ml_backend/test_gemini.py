import sys
import logging
from google import genai
API_KEY = 'AQ.Ab8RN6J_OCTm4pe3ViHRBhLzJbLGskHIP25dAjwdTa7b91SPLg'
try:
    client = genai.Client(api_key=API_KEY)
    response = client.models.generate_content(
        model='gemini-1.5-flash',
        contents='hello'
    )
    print('SUCCESS:', response.text)
except Exception as e:
    print('ERROR:', str(e))
