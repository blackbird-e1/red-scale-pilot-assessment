BENCHMARK_ID = "red-scale-icao-cbta"

BENCHMARK_VERSION = "0.2.0"


COMPETENCIES = {
    "flight_path_management_manual": {
        "name": "Aeroplane Flight Path Management - Manual Control",
        "description": (
            "Controls the flight path through manual control."
        ),
        "source": "ICAO Aeroplane Pilot Competency Framework",
        "behaviours": {

            # ICAO OB 4.1
            "manual_flight_path_control": {
                "name": "Manual Flight Path Control",
                "icao_observable_behaviour": "OB 4.1",
                "description": (
                    "Controls the aircraft manually with accuracy "
                    "and smoothness as appropriate to the situation."
                ),
                "metrics": [
                    "max_bank_angle_deg",
                    "max_pitch_deg",
                    "min_pitch_deg",
                ],
                "criteria": {
                    "type": "telemetry_threshold",
                },
            },

            # ICAO OB 4.2
            "flight_path_deviation_monitoring": {
                "name": "Flight Path Deviation Monitoring",
                "icao_observable_behaviour": "OB 4.2",
                "description": (
                    "Monitors and detects deviations from the "
                    "intended flight path and takes appropriate action."
                ),
                "metrics": [
                    "max_altitude_ft",
                    "min_altitude_ft",
                    "max_speed_knots",
                    "max_descent_rate_fpm",
                ],
                "criteria": {
                    "type": "telemetry_threshold",
                },
            },

            # ICAO OB 4.3
            "attitude_speed_thrust_management": {
                "name": "Attitude, Speed and Thrust Management",
                "icao_observable_behaviour": "OB 4.3",
                "description": (
                    "Manually controls the aeroplane using the "
                    "relationship between attitude, speed and thrust."
                ),
                "metrics": [
                    "max_speed_knots",
                    "avg_speed_knots",
                    "max_pitch_deg",
                    "min_pitch_deg",
                    "avg_throttle_percent",
                ],
                "criteria": {
                    "type": "telemetry_threshold",
                },
            },

            # ICAO OB 4.4
            "safe_flight_path_management": {
                "name": "Safe Flight Path Management",
                "icao_observable_behaviour": "OB 4.4",
                "description": (
                    "Manages the flight path safely to achieve "
                    "appropriate operational performance."
                ),
                "metrics": [
                    "max_altitude_ft",
                    "min_altitude_ft",
                    "max_speed_knots",
                    "max_bank_angle_deg",
                    "max_climb_rate_fpm",
                    "max_descent_rate_fpm",
                ],
                "criteria": {
                    "type": "telemetry_threshold",
                },
            },
        },
    }
}