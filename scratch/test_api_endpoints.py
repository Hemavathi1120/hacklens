"""
API Endpoints Test Runner (Alias to backend.tests.test_api_endpoints)
"""
import sys
from pathlib import Path

_ROOT = Path(__file__).resolve().parent.parent
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

from backend.tests.test_api_endpoints import test_api_routes

if __name__ == "__main__":
    test_api_routes()
