import sys
sys.path.append(r"E:\KisanMitra - Enigma\Disease-Diagnosis\.venv\Lib\site-packages")
from kaggle.api.kaggle_api_extended import get_access_token_from_env
print(get_access_token_from_env())
