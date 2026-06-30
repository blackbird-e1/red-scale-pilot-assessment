from pathlib import Path

from app.core.report import generate_report
from app.services.assessment_service import assess_flight


csv_path = Path("data/fdr_sample.csv")

assessment = assess_flight(csv_path)

report = generate_report(assessment)

print()

print("=" * 70)
print("FLIGHT ASSESSMENT")
print("=" * 70)

print()

print(report)