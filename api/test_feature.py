from app.core.parser import parse_fdr
from app.core.features import extract_features

df = parse_fdr("data/fdr_sample.csv")

features = extract_features(df)

print("\nExtracted Flight Features:\n")
print(features.model_dump())