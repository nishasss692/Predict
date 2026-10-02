import pandas as pd


def normalize_timestamps(df: pd.DataFrame, column: str) -> pd.DataFrame:
    df = df.copy()
    df[column] = pd.to_datetime(df[column], errors="coerce")
    return df


def normalize_numeric(
    df: pd.DataFrame,
    columns: list[str],
) -> pd.DataFrame:
    df = df.copy()

    for column in columns:
        if column in df.columns:
            df[column] = pd.to_numeric(df[column], errors="coerce")

    return df


def normalize_incidents(df: pd.DataFrame) -> pd.DataFrame:
    df = normalize_timestamps(df, "timestamp")

    df = normalize_numeric(
        df,
        ["latitude", "longitude"],
    )

    return df


def normalize_weather(df: pd.DataFrame) -> pd.DataFrame:
    df = normalize_timestamps(df, "timestamp")

    df = normalize_numeric(
        df,
        ["rainfall_mm", "temperature_c"],
    )

    return df


def normalize_sensors(df: pd.DataFrame) -> pd.DataFrame:
    df = normalize_timestamps(df, "timestamp")

    df = normalize_numeric(
        df,
        ["latitude", "longitude", "water_level"],
    )

    return df


def normalize_traffic(df: pd.DataFrame) -> pd.DataFrame:
    df = normalize_timestamps(df, "timestamp")

    df = normalize_numeric(
        df,
        ["latitude", "longitude", "average_speed_kmh"],
    )

    return df


def normalize_infrastructure(df: pd.DataFrame) -> pd.DataFrame:
    df = normalize_numeric(
        df,
        ["latitude", "longitude"],
    )

    return df