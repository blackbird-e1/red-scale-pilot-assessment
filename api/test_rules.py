from pathlib import Path

from app.core.features import extract_features
from app.core.parser import parse_fdr
from app.core.rules import evaluate_rules


csv_path = Path("data/fdr_sample.csv")

df = parse_fdr(csv_path)

features = extract_features(df)

violations = evaluate_rules(features)

print()

print("Extracted Features")

print(features)

print()

print("Rule Violations")

print("-" * 50)

if not violations:
    print("No violations detected.")

else:
    for violation in violations:
        print(violation.model_dump())