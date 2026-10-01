# Red Scale

## AI-Powered Pilot Performance Assessment & Debriefing Platform

**Red Scale turns flight data into objective pilot performance insights,
risk indicators, longitudinal performance intelligence, and
instructor-ready debriefs.**

Instead of forcing an instructor to manually inspect large amounts of
flight telemetry, Red Scale creates a structured workflow:

``` text
Flight Data
    ↓
Performance Assessment
    ↓
Risk & Findings
    ↓
Pilot DNA / Longitudinal Insights
    ↓
Graph-Based Relationships
    ↓
AI-Assisted Debrief
```

The goal is simple:

> **Help instructors understand what happened in a flight, why it
> matters, and how pilot performance is changing over time.**

------------------------------------------------------------------------

# Why Red Scale?

Flight training generates valuable data, but turning that data into
useful training feedback can be time-consuming.

A typical flight can contain thousands of telemetry observations. An
instructor needs to identify the important events, understand whether
they represent meaningful performance issues, compare them with previous
flights, and then communicate the findings to the trainee.

Red Scale is designed to turn that process into a repeatable digital
workflow.

### From this:

> "Here is a flight CSV. Something happened during the flight. Let's
> manually inspect it."

### To this:

> "Here is the objective assessment, the detected findings, the risk
> profile, how this flight compares with previous performance, and an
> AI-assisted explanation for the debrief."

------------------------------------------------------------------------

# Core Principle

## Deterministic Assessment First. AI Interpretation Second.

This is one of the most important design decisions in Red Scale.

The system does **not** ask an LLM to decide whether a pilot violated an
assessment threshold.

Instead:

``` text
Flight telemetry
      ↓
Measured flight characteristics
      ↓
Explicit assessment rules
      ↓
Deterministic findings
      ↓
Risk assessment
      ↓
AI explanation / debrief
```

The deterministic assessment engine remains the source of truth.

The AI layer helps people understand the result.

This separation makes the system easier to inspect, test, explain, and
improve.

------------------------------------------------------------------------

# What Red Scale Does

## 1. Flight Data Assessment

An instructor can upload flight recorder / telemetry data and generate a
structured assessment.

The system currently processes measurable flight behaviour including:

-   Flight duration
-   Maximum altitude
-   Minimum altitude
-   Maximum airspeed
-   Average airspeed
-   Maximum pitch
-   Minimum pitch
-   Roll / bank behaviour
-   Maximum bank angle
-   Maximum climb rate
-   Maximum descent rate
-   Average throttle
-   Telemetry over the flight

The raw data becomes structured performance evidence.

------------------------------------------------------------------------

# 2. Deterministic Flight Assessment

Red Scale evaluates extracted flight characteristics against explicit
assessment rules.

Current assessment areas include:

  Area         Example Finding
  ------------ ------------------------
  Bank angle   Excessive bank angle
  Pitch        Excessive pitch-up
  Pitch        Excessive pitch-down
  Climb        Excessive climb rate
  Descent      Excessive descent rate
  Airspeed     High airspeed

Each finding can contain:

-   Rule ID
-   Rule name
-   Severity
-   Explanation
-   Expected value
-   Actual value

This provides a traceable basis for the assessment rather than relying
on an opaque AI judgement.

------------------------------------------------------------------------

# 3. Risk Assessment

Detected findings are converted into an overall flight assessment.

Red Scale can produce:

-   Risk score
-   Risk level
-   Overall flight rating
-   Number of findings
-   Individual rule violations
-   Extracted flight characteristics
-   Benchmark information

The AI assistant does not modify these values.

------------------------------------------------------------------------

# 4. Pilot DNA

A single flight is useful.

A history of flights is much more useful.

Red Scale therefore includes **Pilot DNA**, a longitudinal view of pilot
performance derived from assessment history.

Instead of looking at every flight as an isolated event, the system can
build a picture of:

-   Repeated performance patterns
-   Historical assessment behaviour
-   Risk progression
-   Recurring findings
-   Changes across flights
-   Longitudinal pilot characteristics

The goal is to help answer questions such as:

> "Is this pilot improving?"

> "What problems keep appearing?"

> "Which areas should an instructor focus on?"

Pilot DNA turns individual assessments into a longer-term training
perspective.

------------------------------------------------------------------------

# 5. Graph-Based Performance Intelligence

Red Scale also includes a lightweight graph-based intelligence layer.

The system models relationships between entities such as:

``` text
Pilot
  ↓
Flight
  ↓
Assessment
  ↓
Finding
  ↓
Competency
  ↓
Event
```

This allows Red Scale to reason about relationships rather than treating
every assessment as an isolated record.

The graph layer is intended to support questions such as:

-   Which previous flights are similar to the latest flight?
-   Which findings repeatedly occur together?
-   Which competencies are associated with recurring findings?
-   What relationships exist across a pilot's assessment history?

The Graph ML / knowledge-graph layer is deliberately focused on
providing useful relationship-aware signals rather than replacing the
deterministic assessment engine.

------------------------------------------------------------------------

# 6. AI-Assisted Debriefing

Once an assessment has been generated, Red Scale provides an AI-assisted
debriefing interface.

The assistant can explain:

-   Flight assessment concepts
-   Telemetry parameters
-   Altitude
-   Airspeed
-   Pitch
-   Roll
-   Bank angle
-   Climb and descent rates
-   SOP concepts
-   Pilot training concepts
-   Risk concepts
-   Mission debrief concepts
-   General aviation operations
-   Aircraft and aviation systems

For a specific flight, the AI works from the assessment information
available to it.

It is designed to explain the evidence rather than invent new evidence.

------------------------------------------------------------------------

# 7. Aviation-Focused AI Assistant

The Red Scale assistant is intentionally aviation-focused.

It is designed for questions involving:

-   Aviation
-   Aircraft
-   Flight operations
-   Piloting
-   Flight assessment
-   Flight telemetry
-   Pilot training
-   Aircraft systems
-   Aviation safety
-   Flight procedures
-   SOPs
-   Navigation
-   Air traffic control
-   Mission planning
-   Mission debriefing
-   Operational risk

The assistant is not intended to be a general-purpose chatbot.

------------------------------------------------------------------------

# 8. Flight Replay & Telemetry Visualization

Red Scale includes flight replay capabilities designed to make telemetry
easier to understand visually.

The replay workflow can connect:

``` text
Telemetry
   ↓
Flight timeline
   ↓
Events / violations
   ↓
Telemetry interpolation
   ↓
Flight visualization
```

The replay interface includes concepts such as:

-   Play / pause / reset
-   Flight timeline
-   Telemetry HUD
-   Event markers
-   Altitude profile
-   Attitude information
-   Telemetry interpolation
-   Violation-to-timestamp mapping
-   3D flight visualization

The purpose is to connect an assessment finding with the moment in the
flight where it occurred.

------------------------------------------------------------------------

# 9. Trainer & Trainee Workflow

Red Scale is not only an analysis engine. It now includes a basic
role-based training workflow.

## Trainee

New users can operate as trainees by default.

A trainee can:

-   Access their trainee portal
-   View their own assessments
-   View their own performance information
-   View Pilot DNA
-   Request trainer access

------------------------------------------------------------------------

## Trainer

A trainer can:

-   Access the trainer console
-   View trainees
-   Select a trainee for assessment
-   Upload flight data
-   Run flight assessments
-   Review findings and risk
-   Review assessment history
-   Use Pilot DNA
-   Use AI-assisted debriefing
-   Delete assessments they created

Trainer access is controlled through the administrator workflow.

------------------------------------------------------------------------

## Administrator

Administrators provide basic organizational access control.

An administrator can:

-   View trainer access requests
-   Approve trainer requests
-   Reject trainer requests
-   View active trainers
-   Demote a trainer back to trainee

The system therefore supports the basic lifecycle:

``` text
New User
   ↓
Trainee
   ↓
Trainer Access Request
   ↓
Administrator Approval
   ↓
Trainer
   ↓
Administrator Demotion
   ↓
Trainee
```

Historical assessment data is preserved when a trainer is demoted.

------------------------------------------------------------------------

# A Complete Training Workflow

A typical instructor workflow looks like this:

``` text
1. Instructor logs in
          ↓
2. Selects a trainee
          ↓
3. Uploads flight data
          ↓
4. Red Scale parses telemetry
          ↓
5. Flight characteristics are extracted
          ↓
6. Deterministic assessment rules run
          ↓
7. Findings and risk are generated
          ↓
8. Assessment is stored
          ↓
9. Pilot DNA is updated
          ↓
10. Graph relationships can be analyzed
          ↓
11. Instructor reviews the flight
          ↓
12. AI assists with the debrief
```

This is the core product loop.

------------------------------------------------------------------------

# What Makes Red Scale Different?

## 1. Evidence Before Interpretation

Red Scale starts with flight evidence.

The system does not begin with an LLM opinion.

``` text
Evidence
  ↓
Assessment
  ↓
Interpretation
```

------------------------------------------------------------------------

## 2. Deterministic Assessment

Safety-relevant assessment logic should be reproducible and traceable.

The underlying assessment is based on explicit rules and measurable
flight characteristics.

------------------------------------------------------------------------

## 3. AI Where It Adds Value

AI is used primarily for:

-   Explanation
-   Natural-language interaction
-   Debrief support
-   Aviation question answering
-   Contextual interpretation

AI is not used as the authority for the underlying assessment result.

------------------------------------------------------------------------

## 4. Longitudinal Pilot Intelligence

Red Scale is designed to move beyond:

> "What happened on this flight?"

towards:

> "What does this flight tell us about the pilot's development?"

Pilot DNA and graph-based relationships support this longer-term
perspective.

------------------------------------------------------------------------

## 5. One Platform for Assessment + Debrief

The system connects:

``` text
Flight Data
    +
Objective Assessment
    +
Risk
    +
Pilot History
    +
Graph Relationships
    +
AI Debrief
```

Instead of treating these as separate tools.

------------------------------------------------------------------------

# Example

Imagine a flight contains an excessive bank-angle event.

Red Scale can follow the chain:

``` text
Telemetry
   ↓
Maximum bank angle detected
   ↓
Assessment rule evaluated
   ↓
Violation generated
   ↓
Risk assessment updated
   ↓
Event associated with the flight
   ↓
Pilot history updated
   ↓
AI explains the finding
```

The instructor can then use that information during the training
debrief.

The AI can explain what excessive bank angle means and help structure
the discussion, while the underlying finding remains tied to the
deterministic assessment.

------------------------------------------------------------------------

# Product Architecture

At a high level, Red Scale consists of several connected layers.

``` text
┌─────────────────────────────────────────┐
│              User Interface             │
│ React / TypeScript                      │
└───────────────────┬─────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│             Application API             │
│ FastAPI                                 │
│ Authentication / RBAC / Assessment API  │
└───────────────────┬─────────────────────┘
                    │
          ┌─────────┴─────────┐
          ▼                   ▼
┌───────────────────┐ ┌───────────────────┐
│ Assessment Engine │ │ AI / Agent Layer  │
│                   │ │                   │
│ Parsing           │ │ AI debrief       │
│ Features          │ │ Aviation chat    │
│ Rules             │ │ Agent tools      │
│ Risk              │ │                   │
└─────────┬─────────┘ └─────────┬─────────┘
          │                     │
          └──────────┬──────────┘
                     ▼
          ┌─────────────────────┐
          │ Training Intelligence│
          │                     │
          │ Pilot DNA           │
          │ Knowledge Graph     │
          │ Graph ML            │
          │ Flight Replay       │
          └─────────────────────┘
```

------------------------------------------------------------------------

# AI Safety & Responsibility Model

Red Scale is deliberately designed so that the AI assistant does not
become the assessment authority.

The assistant should not invent:

-   Flight data
-   SOP violations
-   Aircraft specifications
-   Pilot identity
-   Aircraft type
-   Mission circumstances
-   Weather conditions
-   Operational events

The AI should also not replace:

-   Qualified aviation personnel
-   Aircraft operating manuals
-   Approved SOPs
-   Training procedures
-   Regulatory requirements
-   Operational decision-making

Red Scale is intended to support instructors and trainees, not replace
them.

------------------------------------------------------------------------

# Current MVP Capabilities

The current MVP includes:

### Flight Analysis

-   FDR / telemetry CSV ingestion
-   Flight telemetry parsing
-   Performance feature extraction
-   Deterministic rule evaluation
-   SOP-oriented assessment
-   Risk scoring
-   Overall flight rating
-   Rule violation detection

### Training Intelligence

-   Trainee profiles
-   Trainer workflow
-   Assessment history
-   Pilot DNA
-   Longitudinal performance analysis
-   Graph / relationship-aware analysis

### AI

-   Aviation-focused assistant
-   AI-assisted mission debriefing
-   Context-aware assessment explanation
-   Agent/tool integration
-   Streaming AI responses

### Visualization

-   Flight timeline
-   Telemetry visualization
-   Event markers
-   Altitude profile
-   Attitude information
-   Flight replay capabilities
-   3D visualization components

### Administration

-   Role-based access
-   Trainee → trainer request workflow
-   Administrator approval/rejection
-   Trainer management
-   Trainer demotion

------------------------------------------------------------------------

# Technology

  Layer                 Technology
  --------------------- ---------------------------------------
  Backend               Python / FastAPI
  Frontend              React / TypeScript
  Build Tool            Vite
  Styling               Tailwind CSS
  Database              PostgreSQL
  Data Processing       Pandas
  Numerical Computing   NumPy
  ML Utilities          Scikit-learn
  Validation            Pydantic
  AI                    Groq
  Agent Orchestration   LangGraph
  Graph Intelligence    Knowledge Graph / Graph ML components
  API                   REST / Server-Sent Events
  Authentication        OAuth / JWT-based role-aware access
  Containerisation      Docker
  Testing               Pytest

------------------------------------------------------------------------

# Project Structure

``` text
red-scale-pilot-assessment/
│
├── api/
│   ├── app/
│   │   ├── core/
│   │   ├── models/
│   │   ├── routers/
│   │   ├── services/
│   │   ├── graph/
│   │   ├── tools/
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

------------------------------------------------------------------------

# Getting Started

## Prerequisites

Install:

-   Python 3.12+
-   Node.js
-   npm
-   Docker Desktop if using the containerised setup

------------------------------------------------------------------------

## 1. Clone the Repository

``` bash
git clone https://github.com/blackbird-e1/red-scale-pilot-assessment.git

cd red-scale-pilot-assessment
```

------------------------------------------------------------------------

## 2. Configure the API

``` bash
cd api
```

Create the environment file:

``` bash
cp .env.example .env
```

Configure the required AI credentials:

``` env
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=openai/gpt-oss-120b
```

Additional configuration is available in the example environment file.

------------------------------------------------------------------------

## 3. Install Backend Dependencies

Create a virtual environment:

``` bash
python -m venv .venv
```

### Windows

``` powershell
.venv\Scripts\Activate.ps1
```

### Linux / macOS

``` bash
source .venv/bin/activate
```

Install dependencies:

``` bash
pip install -r requirements.txt
```

------------------------------------------------------------------------

## 4. Start the API

From the `api` directory:

``` bash
uvicorn app.main:app --reload
```

The API runs at:

``` text
http://localhost:8000
```

Interactive API documentation:

``` text
http://localhost:8000/docs
```

------------------------------------------------------------------------

## 5. Start the Frontend

Open another terminal:

``` bash
cd frontend
```

Install dependencies:

``` bash
npm install
```

Start the development server:

``` bash
npm run dev
```

The frontend normally runs at:

``` text
http://localhost:5173
```

------------------------------------------------------------------------

# API Overview

The backend exposes APIs for authentication, assessment, training
workflows, debriefing, and conversational assistance.

Representative endpoints include:

``` text
GET  /health

POST /api/v1/assessment
GET  /api/v1/assessment/pilot/{pilot_id}
GET  /api/v1/assessment/{assessment_id}
DELETE /api/v1/assessment/{assessment_id}

POST /api/v1/debrief

POST /api/v1/chat
POST /api/v1/chat/stream
```

Trainer-access management includes:

``` text
POST /api/v1/trainer-requests
GET  /api/v1/trainer-requests/me

GET  /api/v1/admin/trainer-requests
POST /api/v1/admin/trainer-requests/{request_id}/approve
POST /api/v1/admin/trainer-requests/{request_id}/reject

GET  /api/v1/admin/trainers
POST /api/v1/admin/users/{user_id}/demote
```

------------------------------------------------------------------------

# Security & Access Model

Red Scale uses role-aware access control.

The current role model is:

``` text
ADMIN
  │
  ├── Manage trainer access
  └── Manage trainer roles

TRAINER
  │
  ├── Assess trainees
  ├── Review assessments
  └── Perform trainer operations

TRAINEE
  │
  ├── View own training information
  └── Request trainer access
```

Assessment permissions are also role-aware.

For example:

-   Trainers can create assessments.
-   Trainers can delete assessments they created.
-   Administrators can manage assessment access.
-   Trainees cannot create assessments.
-   Trainees are restricted to their own assessment information.

------------------------------------------------------------------------

# Design Philosophy

## Deterministic First

Safety-relevant assessment decisions should be reproducible and
traceable.

------------------------------------------------------------------------

## Evidence Before Interpretation

Assessment findings should come from flight evidence.

The AI layer interprets the resulting evidence rather than creating
evidence.

------------------------------------------------------------------------

## AI as an Assistant

AI should improve the usability of information without becoming the
authority for the underlying assessment.

------------------------------------------------------------------------

## Human-in-the-Loop

Qualified instructors remain part of the decision-making process.

Red Scale is designed to help instructors make training information
easier to understand and act upon.

------------------------------------------------------------------------

# Current Scope

Red Scale is intentionally focused.

The current product is centered on:

``` text
Flight Assessment
        +
Pilot Performance Intelligence
        +
Instructor Debriefing
```

It is **not currently intended to be a complete flight-school ERP**.

Features such as:

-   Billing
-   Scheduling
-   Fleet management
-   Account deactivation
-   Account deletion
-   Broader school administration

are outside the current core product scope.

They can be added later if real customer requirements justify them.

This keeps the product focused on its primary value: **pilot performance
intelligence and training debriefing.**

------------------------------------------------------------------------

# Roadmap

Future development can focus on increasing the depth and reliability of
the core product rather than simply adding administrative modules.

Potential areas include:

-   Production deployment
-   Security hardening
-   Stronger auditability
-   More configurable assessment rule sets
-   Additional flight-data formats
-   Richer flight visualization
-   More advanced comparative pilot analysis
-   Expanded Pilot DNA insights
-   More advanced graph-based analysis
-   Training progression analytics
-   Instructor workflow improvements
-   Additional mission intelligence
-   Validation with real-world aviation training data
-   Integration with approved training workflows

------------------------------------------------------------------------

# What Red Scale Is --- and Is Not

### Red Scale is:

-   A pilot performance assessment platform
-   A flight-data analysis system
-   A training intelligence platform
-   An instructor debriefing tool
-   An AI-assisted aviation interface
-   A longitudinal pilot performance system

### Red Scale is not:

-   A certified flight-safety system
-   An autonomous flight-control system
-   A replacement for a qualified instructor
-   A replacement for aircraft manuals
-   A replacement for approved SOPs
-   A replacement for regulatory requirements
-   An autonomous operational decision-maker

------------------------------------------------------------------------

# Demonstration Story

For an instructor or flight school, the simplest Red Scale demonstration
is:

``` text
                    LOGIN
                      ↓
                 Select Trainee
                      ↓
                Upload Flight
                      ↓
             Run Assessment
                      ↓
        ┌─────────────┴─────────────┐
        ↓                           ↓
   Flight Findings              Risk Score
        │                           │
        └─────────────┬─────────────┘
                      ↓
                 Pilot DNA
                      ↓
             Graph Relationships
                      ↓
                 AI Debrief
                      ↓
             Instructor Discussion
```

The product story is therefore not:

> "We built another chatbot."

It is:

> **"We built a system that turns flight data into structured training
> intelligence."**

------------------------------------------------------------------------

# Vision

Red Scale is being developed toward a future where flight training is
increasingly supported by objective, data-driven performance
intelligence.

The long-term vision is to connect:

``` text
Flight Data
     +
Objective Assessment
     +
Pilot History
     +
Training Context
     +
Relationship Intelligence
     +
AI-Assisted Debrief
```

into one continuous training intelligence platform.

The goal is not to remove the instructor from the loop.

The goal is to give the instructor **better evidence, better context,
and better tools for the debrief.**

------------------------------------------------------------------------

# Disclaimer

Red Scale is an experimental AI-assisted flight assessment and
debriefing system intended for research, development, demonstration, and
training-oriented use.

It is **not a certified aviation safety system** and must not be used as
a substitute for:

-   Qualified aviation personnel
-   Approved aircraft documentation
-   Official SOPs
-   Regulatory requirements
-   Training procedures
-   Operational decision-making

Assessment results are generated from configured rules and supplied
flight data and should be independently reviewed before being used for
real-world training or operational purposes.

Any future operational deployment should undergo appropriate aviation
validation, security review, testing, and integration with approved
procedures.

------------------------------------------------------------------------

# License

This project is licensed under the MIT License.
