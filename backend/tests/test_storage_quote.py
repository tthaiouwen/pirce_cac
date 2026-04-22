import sys
import unittest
from pathlib import Path


BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from app.schemas.quote import QuoteCalculateRequest
from app.services.quote_service import QuoteService


class StorageQuoteTestCase(unittest.TestCase):
    def test_oss_storage_quote_uses_legacy_storage_tables(self):
        payload = QuoteCalculateRequest(
            product_code="oss_storage",
            category_code="storage",
            period_months=12,
            quantity=1,
            config={
                "storage_spec": "100G",
                "storage_quantity": 1,
                "stream_spec": "50G",
                "stream_quantity": 1,
            },
        )

        result = QuoteService().calculate(payload)

        self.assertEqual(result.product_code, "oss_storage")
        self.assertEqual(result.period_display, "1年")
        self.assertEqual(result.sale_total_price, 191.25)
        self.assertEqual(result.min_total_price, 80.26)


if __name__ == "__main__":
    unittest.main()
