BENCHMARK_ID = "red-scale-icao-cbta"

BENCHMARK_VERSION = "0.3.1"


# IMPORTANT:
# The ICAO observable behaviours below are mapped from the
# ICAO Aeroplane Pilot Competency Framework.
#
# The numeric telemetry thresholds are NOT ICAO-prescribed limits.
# They are Red Scale prototype operational criteria used to make
# the benchmark deterministic and testable.
#
# Production deployment should replace these prototype thresholds
# with operator/aircraft/scenario-specific performance criteria.

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
                    "source": "Red Scale prototype operational criteria",
                    "metrics": {
                        "max_bank_angle_deg": {
                            "operator": "max",
                            "attention": 30.0,
                            "deviation": 45.0,
                        },
                        "max_pitch_deg": {
                            "operator": "max",
                            "attention": 15.0,
                            "deviation": 20.0,
                        },
                        "min_pitch_deg": {
                            "operator": "min",
                            "attention": -10.0,
                            "deviation": -15.0,
                        },
                    },
                },
                "conditions": {
                    "scope": "whole_flight",
                    "aircraft_specific": False,
                },
                "standard": {
                    "status_vocabulary": [
                        "observed",
                        "attention",
                        "deviation",
                    ],
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
                    "max_speed_knots",
                    "max_descent_rate_fpm",
                ],
                "criteria": {
                    "type": "telemetry_threshold",
                    "source": "Red Scale prototype operational criteria",
                    "metrics": {
                        "max_altitude_ft": {
                            "operator": "max",
                            "attention": 11000.0,
                            "deviation": 12000.0,
                        },
                        "max_speed_knots": {
                            "operator": "max",
                            "attention": 220.0,
                            "deviation": 250.0,
                        },
                        "max_descent_rate_fpm": {
                            "operator": "max",
                            "attention": 1500.0,
                            "deviation": 2000.0,
                        },
                    },
                },
                "conditions": {
                    "scope": "whole_flight",
                    "aircraft_specific": False,
                    "note": (
                        "Altitude criteria are prototype absolute "
                        "limits and do not represent an intended "
                        "flight-path profile."
                    ),
                },
                "standard": {
                    "status_vocabulary": [
                        "observed",
                        "attention",
                        "deviation",
                    ],
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
                    "source": "Red Scale prototype operational criteria",
                    "metrics": {
                        "max_speed_knots": {
                            "operator": "max",
                            "attention": 220.0,
                            "deviation": 250.0,
                        },
                        "avg_speed_knots": {
                            "operator": "max",
                            "attention": 210.0,
                            "deviation": 240.0,
                        },
                        "max_pitch_deg": {
                            "operator": "max",
                            "attention": 15.0,
                            "deviation": 20.0,
                        },
                        "min_pitch_deg": {
                            "operator": "min",
                            "attention": -10.0,
                            "deviation": -15.0,
                        },
                        "avg_throttle_percent": {
                            "operator": "max",
                            "attention": 90.0,
                            "deviation": 95.0,
                        },
                    },
                },
                "conditions": {
                    "scope": "whole_flight",
                    "aircraft_specific": False,
                },
                "standard": {
                    "status_vocabulary": [
                        "observed",
                        "attention",
                        "deviation",
                    ],
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
                    "max_speed_knots",
                    "max_bank_angle_deg",
                    "max_climb_rate_fpm",
                    "max_descent_rate_fpm",
                ],
                "criteria": {
                    "type": "telemetry_threshold",
                    "source": "Red Scale prototype operational criteria",
                    "metrics": {
                        "max_altitude_ft": {
                            "operator": "max",
                            "attention": 11000.0,
                            "deviation": 12000.0,
                        },
                        "max_speed_knots": {
                            "operator": "max",
                            "attention": 220.0,
                            "deviation": 250.0,
                        },
                        "max_bank_angle_deg": {
                            "operator": "max",
                            "attention": 30.0,
                            "deviation": 45.0,
                        },
                        "max_climb_rate_fpm": {
                            "operator": "max",
                            "attention": 1500.0,
                            "deviation": 2000.0,
                        },
                        "max_descent_rate_fpm": {
                            "operator": "max",
                            "attention": 1500.0,
                            "deviation": 2000.0,
                        },
                    },
                },
                "conditions": {
                    "scope": "whole_flight",
                    "aircraft_specific": False,
                },
                "standard": {
                    "status_vocabulary": [
                        "observed",
                        "attention",
                        "deviation",
                    ],
                },
            },
        },
    }
}