from app.core.parser import parse_fdr


def test_parse_fdr():
    df = parse_fdr("data/fdr_sample.csv")

    assert df is not None
    assert not df.empty
    assert "timestamp_sec" in df.columns