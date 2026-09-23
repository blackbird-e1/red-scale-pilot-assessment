BENCHMARK_ID = "red-scale-icao-cbta"
BENCHMARK_VERSION = "0.1.0"


COMPETENCIES = {
    "flight_path_management_manual": {
        "name": "Aircraft Flight Path Management - Manual Control",
        "behaviours": {
            "bank_management": {
                "name": "Bank Management",
                "metric": "max_bank_angle_deg",
            },
            "airspeed_control": {
                "name": "Airspeed Control",
                "metric": "max_speed_knots",
            },
            "altitude_management": {
                "name": "Altitude Management",
                "metrics": [
                    "max_altitude_ft",
                    "min_altitude_ft",
                ],
            },
            "descent_management": {
                "name": "Descent Management",
                "metric": "max_descent_rate_fpm",
            },
        },
    }
}