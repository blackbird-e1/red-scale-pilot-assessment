from pydantic import BaseModel


class FlightFeatures(BaseModel):
    duration_sec: float

    max_altitude_ft: float
    min_altitude_ft: float

    max_speed_knots: float
    avg_speed_knots: float

    max_pitch_deg: float
    min_pitch_deg: float

    max_roll_deg: float
    min_roll_deg: float

    max_bank_angle_deg: float

    max_climb_rate_fpm: float
    max_descent_rate_fpm: float

    avg_throttle_percent: float