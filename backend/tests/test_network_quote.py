import sys
import unittest
from pathlib import Path


BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from app.schemas.quote import QuoteCalculateRequest
from app.services.quote_service import QuoteService


class NetworkQuoteTestCase(unittest.TestCase):
    def test_internet_bandwidth_quote_uses_step_pricing(self):
        payload = QuoteCalculateRequest(
            product_code="internet_bandwidth",
            category_code="network",
            period_months=12,
            quantity=1,
            config={
                "bandwidth": 5,
            },
        )

        result = QuoteService().calculate(payload)

        self.assertEqual(result.product_code, "internet_bandwidth")
        self.assertEqual(result.period_display, "1年")
        self.assertEqual(result.sale_total_price, 1200.0)
        self.assertEqual(result.min_total_price, 480.0)


if __name__ == "__main__":
    unittest.main()
