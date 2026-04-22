import sys
import unittest
from pathlib import Path


BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from app.schemas.quote import QuoteCalculateRequest
from app.services.quote_service import QuoteService


class EcsQuoteTestCase(unittest.TestCase):
    def test_ecs_quote_uses_legacy_price_table(self):
        payload = QuoteCalculateRequest(
            product_code="ecs",
            category_code="compute",
            period_months=12,
            quantity=2,
            config={
                "spec_type": "general",
                "vcpu": 1,
                "memory": 1,
            },
        )

        result = QuoteService().calculate(payload)

        self.assertEqual(result.product_code, "ecs")
        self.assertEqual(result.period_display, "1年")
        self.assertEqual(result.sale_total_price, 1440.0)
        self.assertEqual(result.min_total_price, 576.0)


if __name__ == "__main__":
    unittest.main()
