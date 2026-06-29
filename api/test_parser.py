from app.core.parser import parse_fdr

df = parse_fdr("data/fdr_sample.csv")

print(df.info())
print()
print(df.head())