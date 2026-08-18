# Red Scale

## AI Pilot Debrief & Assessment System

Red Scale is an AI-assisted pilot assessment and mission debriefing system that transforms flight recorder data into structured performance assessments, operational risk indicators, and natural-language debriefs.

The system is designed around a simple principle:

> **Deterministic assessment first. AI interpretation second.**

Flight telemetry is parsed into measurable flight characteristics, evaluated against explicit assessment rules, converted into a deterministic risk assessment, and then presented through an AI-assisted debrief interface.

---

## Overview

Red Scale provides a structured workflow for analysing flight performance:

```text
Flight Data Recorder CSV
          ↓
       Parser
          ↓
   Feature Extraction
          ↓
   Deterministic Rules
          ↓
     Risk Assessment
          ↓
      AI Debrief
```

The deterministic assessment engine remains authoritative for the actual assessment result.

The AI assistant is used to explain aviation concepts, interpret available assessment information, and support the debriefing process. It does not determine or override the underlying assessment result.

---

## Current MVP

The current MVP supports:

* Flight Data Recorder CSV ingestion
* Flight telemetry parsing
* Flight performance feature extraction
* Deterministic rule evaluation
* SOP-oriented flight assessment
* Risk scoring
* Overall flight rating
* Rule violation detection
* AI-assisted mission debriefing
* Aviation-focused conversational assistance
* Streaming AI responses through Server-Sent Events

The system currently focuses on the assessment of measurable flight behaviour from uploaded flight data.

---

## Assessment Pipeline

### 1. Flight Data

The user uploads a Flight Data Recorder (FDR) CSV containing flight telemetry.

The uploaded data forms the evidence base for the assessment.

---

### 2. Data Parsing

The backend parses the uploaded flight data and converts the raw telemetry into a structured representation suitable for analysis.

---

### 3. Feature Extraction

Red Scale derives flight-performance characteristics from the telemetry.

Current assessment features include parameters such as:

* Flight duration
* Maximum altitude
* Minimum altitude
* Maximum airspeed
* Maximum bank angle
* Maximum pitch
* Minimum pitch
* Maximum climb rate
* Maximum descent rate

These features provide the measurable basis for the subsequent rule evaluation.

---

### 4. Deterministic Rule Evaluation

The extracted features are evaluated against configured assessment thresholds.

Current rules include checks for:

| Assessment Area | Rule                   |
| --------------- | ---------------------- |
| Bank angle      | Excessive bank angle   |
| Pitch           | Excessive pitch-up     |
| Pitch           | Excessive pitch-down   |
| Climb           | Excessive climb rate   |
| Descent         | Excessive descent rate |
| Airspeed        | High airspeed          |

The rule engine produces explicit violations containing information such as:

* Rule ID
* Rule name
* Severity
* Explanation
* Expected value
* Actual value

This layer is deterministic and does not depend on an LLM.

---

## Risk Assessment

Detected rule violations are converted into an overall risk assessment.

The assessment engine produces:

* Overall rating
* Risk score
* Risk level
* Number of detected violations
* Individual rule violations
* Extracted flight characteristics

The AI assistant does not modify these values.

The deterministic assessment engine is the source of truth for the assessment.

---

## AI Debrief

Once an assessment has been generated, Red Scale provides an AI-assisted interface for interpreting the results.

The AI layer can explain:

* Flight assessment concepts
* Telemetry parameters
* Altitude
* Airspeed
* Pitch
* Roll
* Bank angle
* Climb and descent rates
* SOP concepts
* Pilot training concepts
* Mission debrief concepts
* Risk assessment concepts
* General aviation operations
* Aircraft and aviation systems

When discussing a specific flight, the assistant is instructed to use only the assessment information available in the conversation.

It must not invent:

* Flight data
* SOP violations
* Aircraft specifications
* Pilot identity
* Aircraft type
* Mission circumstances
* Weather conditions
* Operational events

The AI layer is therefore an **explanation and debriefing interface**, not the assessment authority.

---

## Aviation-Only Assistant

The Red Scale side assistant is intentionally scoped to aviation and flight-related topics.

It is designed to assist with questions involving areas such as:

* Aviation
* Aircraft
* Flight operations
* Piloting
* Flight assessment
* Flight telemetry
* Pilot training
* Aircraft systems
* Aviation safety
* Flight procedures
* SOPs
* Navigation
* Air traffic control
* Mission planning
* Mission debriefing
* Operational risk

Unrelated general-purpose questions are outside the scope of the assistant.

---

## Architecture

Red Scale consists of three primary layers.

### Deterministic Assessment Engine

Responsible for:

* Parsing flight data
* Extracting features
* Applying assessment rules
* Detecting violations
* Calculating risk
* Producing the final assessment

This layer does not rely on generative AI.

### AI Debrief Layer

A Groq-powered conversational assistant provides natural-language explanations and debrief support.

The assistant receives the available assessment context and explains it without modifying the underlying result.

### Web Interface

The frontend provides a pilot assessment console where users can:

1. Upload flight data
2. Run the assessment
3. Review extracted flight characteristics
4. Review detected violations
5. Review risk and overall rating
6. Interact with the Red Scale Assistant

---

## Tech Stack

| Layer                      | Technology                |
| -------------------------- | ------------------------- |
| Language                   | Python 3.12               |
| Backend                    | FastAPI                   |
| AI                         | Groq                      |
| Frontend                   | React + TypeScript        |
| Build Tool                 | Vite                      |
| Styling                    | Tailwind CSS              |
| Data Processing            | Pandas                    |
| Numerical Computing        | NumPy                     |
| Machine Learning Utilities | Scikit-learn              |
| Validation                 | Pydantic                  |
| Rate Limiting              | SlowAPI                   |
| API Communication          | HTTP / Server-Sent Events |
| Containerisation           | Docker                    |

---

## Project Structure

```text
red-scale-pilot-assessment/
│
├── api/
│   ├── app/
│   │   ├── core/
│   │   │   ├── ml.py
│   │   │   └── rules.py
│   │   │
│   │   ├── models/
│   │   │   ├── assessment.py
│   │   │   ├── flight_features.py
│   │   │   └── rule_violation.py
│   │   │
│   │   ├── routers/
│   │   │   ├── assessment.py
│   │   │   ├── debrief.py
│   │   │   └── chat.py
│   │   │
│   │   ├── services/
│   │   │   ├── assessment_service.py
│   │   │   └── debrief_service.py
│   │   │
│   │   ├── agent.py
│   │   ├── config.py
│   │   └── main.py
│   │
│   ├── tests/
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/
│   └── src/
│       ├── components/
│       ├── hooks/
│       ├── api/
│       ├── App.tsx
│       ├── types.ts
│       └── main.tsx
│
├── resources/
├── scripts/
├── nginx/
├── docker-compose.yml
└── README.md
```

---

## Getting Started

### Prerequisites

Install:

* Python 3.12
* Node.js
* npm
* Docker Desktop (if using the containerised setup)

---

## 1. Clone the Repository

```bash
git clone https://github.com/blackbird-e1/red-scale-pilot-assessment.git

cd red-scale-pilot-assessment
```

---

## 2. Configure the API

Move into the API directory:

```bash
cd api
```

Create the environment file:

```bash
cp .env.example .env
```

Configure the required Groq credentials:

```env
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=openai/gpt-oss-120b
```

Additional configuration options are available in the example environment file.

---

## 3. Install Backend Dependencies

Create a virtual environment:

```bash
python -m venv .venv
```

Activate it.

### Windows

```powershell
.venv\Scripts\Activate.ps1
```

### Linux / macOS

```bash
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

---

## 4. Start the API

From the `api` directory:

```bash
uvicorn app.main:app --reload
```

The API will run on:

```text
http://localhost:8000
```

During development, API documentation is available at:

```text
http://localhost:8000/docs
```

---

## 5. Start the Frontend

Open another terminal and move into the frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173
```

---

## API

The backend exposes endpoints for flight assessment, debriefing, health checks, and conversational assistance.

### Health

```http
GET /health
```

### Flight Assessment

```http
POST /api/v1/assessment
```

Used to submit flight data and generate an assessment.

### Debrief

```http
POST /api/v1/debrief
```

Used to generate an AI-assisted interpretation of an assessment.

### Chat

```http
POST /api/v1/chat
```

Used for non-streaming aviation assistant responses.

### Streaming Chat

```http
POST /api/v1/chat/stream
```

Provides Server-Sent Events for real-time assistant responses.

---

## Example Assessment Flow

A typical assessment follows this sequence:

```text
Upload FDR CSV
      ↓
Parse telemetry
      ↓
Extract flight features
      ↓
Evaluate deterministic rules
      ↓
Detect violations
      ↓
Calculate risk
      ↓
Generate assessment
      ↓
Explain through AI debrief
```

For example, if the extracted telemetry contains a maximum bank angle above the configured threshold, the deterministic rule engine can produce an excessive-bank-angle violation.

The AI assistant can then explain what excessive bank angle means operationally without changing the underlying violation.

---

## Design Principles

### Deterministic First

Safety-relevant assessment decisions should be reproducible and traceable.

The assessment engine therefore uses explicit rules rather than asking an LLM to decide whether a flight violated an assessment threshold.

### Evidence Before Interpretation

The system derives assessment findings from the uploaded flight data.

The AI layer interprets the resulting evidence rather than creating evidence.

### AI as an Assistant

The AI component is intended to improve the usability of assessment results through explanation and debriefing.

It does not replace:

* Qualified aviation personnel
* Aircraft operating manuals
* Official SOPs
* Training procedures
* Regulatory requirements
* Operational decision-making

### Separation of Responsibilities

The system separates:

```text
Telemetry
   ↓
Deterministic Assessment
   ↓
Assessment Result
   ↓
AI Interpretation
```

This separation makes the assessment pipeline easier to inspect, test, and improve independently of the language model.

---

## Current Limitations

The current MVP is intentionally limited.

Current limitations include:

* Authentication and authorization are not yet implemented.
* Assessment rules are currently configured as deterministic thresholds.
* The system currently accepts FDR CSV data as its primary input.
* Mission logs and additional operational data sources are planned but not yet active.
* The AI assistant is explanatory and does not independently validate real-world operational conditions.
* The system should not be treated as an operational flight-safety system without appropriate validation, certification, and integration with approved aviation procedures.

Do not deploy the system publicly until appropriate access controls and production security measures are in place.

---

## Roadmap

Planned development areas include:

* Authentication and authorization
* Pilot and instructor accounts
* Assessment history
* Persistent flight records
* Mission and training profiles
* Configurable SOP/rule sets
* Additional flight-data formats
* Richer telemetry visualisation
* Comparative pilot performance analysis
* Training progression tracking
* Instructor review workflows
* Expanded mission intelligence
* Production deployment and security hardening

---

## Disclaimer

Red Scale is an experimental AI-assisted flight assessment and debriefing system.

It is intended for research, development, demonstration, and training-oriented use.

It is **not** a certified aviation safety system and should not be used as a substitute for qualified aviation personnel, approved aircraft documentation, official SOPs, regulatory requirements, or operational decision-making.

Assessment results are generated from the configured rules and the supplied flight data and should be independently reviewed before being used for any real-world training or operational purpose.

---

## License

This project is licensed under the MIT License.
