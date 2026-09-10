# IDX Exchange — AI Agentic Real Estate Assistant

**Summer 2026 Internship | Keya Chaudhari**

## Project Overview

The IDX Exchange AI Agentic Real Estate Assistant is a multi-agent real estate system built throughout a 12-week internship project.

The project combines natural-language property search, MySQL real estate data, market analytics, semantic search, recommendations, retrieval-augmented generation (RAG), multi-agent routing, WhatsApp-style communication, and human-in-the-loop email safety workflows.

The system works with two main real estate datasets:

- `rets_property` — active property listings
- `california_sold` — historical sold-property data

---

## Tech Stack

- **Languages:** TypeScript, Python
- **Database:** MySQL
- **AI:** Google Gemini
- **Embeddings:** Gemini Embeddings
- **Similarity Search:** Cosine similarity
- **Data Analysis:** pandas, NumPy
- **Orchestration:** Multi-agent intent routing
- **Communication:** OpenClaw / WhatsApp integration and local WhatsApp handler simulation
- **Email:** HTML email templates with human approval guardrails
- **Version Control:** Git and GitHub

---

## System Architecture

```text
                    User
                      |
                      v
             WhatsApp / Interface
                      |
                      v
                Orchestrator
             (Intent Classifier)
                      |
        +-------------+-------------+
        |             |             |
        v             v             v
 Property Search   Market Stats   Recommendation
     Agent            Agent          Agent
        |             |             |
        v             v             v
 rets_property  california_sold   Both Tables
        |
        +-------------------------------+
                                        |
                                        v
                                   RAG Agent
                                        |
                                        v
                               Knowledge Documents

                      |
                      v
                  Email Agent
                      |
                      v
             Draft -> Human Approval
                      |
                      v
               Send / Reject
```

The orchestrator identifies the user's intent and routes the request to the appropriate specialized agent. Mixed requests can route to multiple agents.

---

## Database Usage

### `rets_property`

Used for active property search, property information, semantic similarity, and recommendations.

Important fields include:

- `L_ListingID` — MLS listing ID
- `L_Address` — property address
- `L_City` — city
- `L_SystemPrice` — current listing price
- `L_Keyword2` — bedrooms
- `LM_Dec_3` — bathrooms
- `LM_Int2_3` — approximate square footage
- `L_Status` — listing status
- `L_Remarks` — property description
- `YearBuilt` — year constructed
- `AssociationFee` — HOA fee
- `PoolPrivateYN` — private pool indicator

### `california_sold`

Used for historical market analysis and comparable sales.

Important fields used in the project include:

- `City`
- `ClosePrice`
- `CloseDate`
- `ListPrice`
- `OriginalListPrice`
- `LivingArea`
- `DaysOnMarket`
- `PropertyType`
- `YearBuilt`
- `BedroomsTotal`
- `BathroomsTotalInteger`
- `StandardStatus`

---

## Weekly Progress

- [x] Week 1 — Environment Setup
- [x] Week 2 — Natural Language Property Search
- [x] Week 3 — MySQL Database Integration
- [x] Week 4 — Conversational Search
- [x] Week 5 — Market Statistics & Trend Analysis
- [x] Week 6 — Embeddings & Semantic Similarity Search
- [x] Week 7 — Recommendation Engine
- [x] Week 8 — RAG Knowledge Assistant
- [x] Week 9 — Multi-Agent Orchestration
- [x] Week 10 — WhatsApp Communication Layer
- [x] Week 11 — Email Agent & Safety Guardrails
- [ ] Week 12 — Final Capstone Integration & Demo

---

## Major Features

### Natural Language Property Search

Users can search active listings using natural-language property criteria such as city, price, bedrooms, and other property attributes.

Data source:

`rets_property`

### Market Analytics

The market statistics component analyzes historical sold-property data.

Metrics include:

- average close price
- price per square foot
- days on market
- sales volume
- list-to-close ratio
- monthly price trends

Data source:

`california_sold`

### Semantic Similarity Search

Property descriptions and characteristics can be represented using embeddings and compared using cosine similarity.

This allows the system to find properties that are semantically similar rather than relying only on exact keyword matches.

### Recommendation Engine

The recommendation engine combines:

- structured property similarity
- semantic embedding similarity
- recent sold comparable validation

It uses information from both `rets_property` and `california_sold`.

### RAG Knowledge Assistant

The Retrieval-Augmented Generation pipeline answers real estate and MLS questions using an indexed project knowledge base.

Indexed sources include:

1. Real Estate Data Analyst Primer
2. Trestle Property Metadata
3. Week 5 Market Summaries
4. IDX Schema Reference

The documents are divided into chunks and converted into embeddings. When a question is asked, cosine similarity retrieves relevant chunks before the language model generates a grounded answer.

Example questions:

- What does DOM mean?
- What columns are in `california_sold`?
- What is a list-to-close ratio?
- What is `L_SystemPrice`?
- What does `L_Keyword2` mean?
- What is `L_Remarks`?

### Multi-Agent Orchestration

The Week 9 orchestrator classifies user intent and routes requests to specialized agents.

Supported intents include:

- `search`
- `market`
- `recommend`
- `knowledge`
- `mixed`

Mixed requests can execute property search and market analysis together.

### WhatsApp Communication Layer

The WhatsApp communication layer formats agent responses for a mobile-friendly interface.

Tested response types include:

- property search results
- market reports
- general text responses

The project has also tested OpenClaw WhatsApp connectivity. The Week 10 handler currently provides a local simulation for controlled development and testing.

### Email Safety Guardrails

The email agent follows a human-in-the-loop workflow.

```text
Create Email Draft
        |
        v
pending_approval
        |
   +----+----+
   |         |
Approve    Reject
   |         |
   v         v
 Send      Blocked
```

Emails must never proceed directly from generation to sending.

The safety tests verify that:

- creating a draft does not send it
- a draft begins as `pending_approval`
- an approved draft can proceed to the send step
- a rejected draft cannot be sent afterward

The current Week 11 send operation is simulated for safe local testing.

---

## RAG Knowledge Sources

The Week 8 knowledge base contains:

```text
week-08-rag/docs/
├── real-estate-primer.txt
├── trestle-metadata.txt
├── week5-market-summary.txt
└── idx-schema-reference.txt
```

These sources provide real estate terminology, RESO/Trestle metadata definitions, market analytics context, and project-specific IDX field mappings.

---

## Project Structure

```text
IDX_Internship/
├── week-01-architecture/
├── week-02-nlp-search/
├── week-03-database/
├── week-04-conversational/
├── week-05-market-stats/
├── week-06-embeddings/
├── week-07-recommendations/
├── week-08-rag/
├── week-09-orchestration/
├── week-10-whatsapp/
├── week-11-email/
├── openclaw/
├── sql/
├── .env
└── README.md
```

---

## Running Key Components

Activate the Python environment when required:

```bash
source ~/Desktop/IDX_Internship/venv/bin/activate
```

### Week 5 — Market Analytics

```bash
cd ~/Desktop/IDX_Internship/week-05-market-stats
python3 trend-analysis.py
```

### Week 7 — Recommendation Engine

```bash
cd ~/Desktop/IDX_Internship/week-07-recommendations
python3 recommendation-engine.py
```

### Week 8 — RAG Knowledge Assistant

```bash
cd ~/Desktop/IDX_Internship/week-08-rag
python3 rag-pipeline.py
```

### Week 9 — Multi-Agent Orchestrator

```bash
cd ~/Desktop/IDX_Internship/week-09-orchestration
npx ts-node orchestrator.ts
```

### Week 10 — WhatsApp Handler Simulation

```bash
cd ~/Desktop/IDX_Internship/week-10-whatsapp
npx ts-node whatsapp-handler.ts
```

### Week 11 — Email Safety Workflow

```bash
cd ~/Desktop/IDX_Internship/week-11-email
npx ts-node email-agent.ts
```

---

## Environment Variables

Credentials and API keys are stored in `.env` and should never be committed to GitHub.

Examples include:

```text
MYSQL_HOST
MYSQL_USER
MYSQL_PASSWORD
MYSQL_DATABASE
GEMINI_API_KEY
```

---

## Safety Principles

The project follows several safety rules:

- Database credentials and API keys remain in environment variables.
- Database interactions are limited to the project datasets.
- Outbound email requires explicit human approval.
- Rejected email drafts cannot subsequently be sent.
- Communication integrations are tested locally before enabling outbound behavior.

---

## Current Capstone Status

Weeks 1–11 have been implemented and tested individually.

Week 12 focuses on:

- final integration
- architecture documentation
- schema annotations
- README completion
- end-to-end testing
- demo preparation
- backup demo recording
- written reflection

---

## Author

**Keya Chaudhari**  
IDX Exchange — AI Agentic Engineer Internship  
Summer 2026
