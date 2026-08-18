from app.core.features import extract_features
from app.core.parser import parse_fdr
from app.core.rules import evaluate_rules


def test_evaluate_rules():
    df = parse_fdr("data/fdr_sample.csv")

    features = extract_features(df)

    violations = evaluate_rules(features)

    assert violations is not None

    for violation in violations:
        assert violation.code
        assert violation.severity
        assert violation.message