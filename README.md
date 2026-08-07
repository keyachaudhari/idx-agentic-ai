# IDX Exchange — AI Agentic Real Estate Assistant
**Summer 2026 Internship | Keya Chaudhari**

## What This Project Does
A production-grade multi-agent AI assistant that helps users search for California real estate properties, analyze market trends, get personalized recommendations, and ask real estate questions — all through WhatsApp and email

## Tech Stack
- **Runtime**: OpenClaw (multi-agent orchestration)
- **Databases**: MySQL (rets_property ~53K listings, california_sold ~87K sold)
- **AI/Embeddings**: Google Gemini (gemini-2.0-flash + text-embedding-004)
- **Languages**: TypeScript + Python
- **Communication**: WhatsApp (via OpenClaw), Email (nodemailer)

## Architecture


## Weekly Progress

- [x] Week 1 – Environment Setup
- [x] Week 2 – Property Search Agent
- [x] Week 3 – MySQL Database Integration
- [x] Week 4 – Semantic Search & Embeddings
- [x] Week 5 – Market Statistics Agent
- [x] Week 6 – Embeddings & Vector Search
- [x] Week 7 – Recommendation Engine
- [ ] Week 8 – RAG (Retrieval-Argumented Generation) Pipeline
- [ ] Week 9 – Multi-Agent Orchestration
- [ ] Week 10 – WhatsApp Communication Layer
- [ ] Week 11 – Email Agents & Safety Guardrails
- [ ] Week 12 – Capstone: Everything Together

## How to Run

### Setup

# Install dependencies
npm install
pip install -r requirements.txt

# Configure environment
cp .env.example .env

# GEMINI_API_KEY and MySQL credentials


### Run each component

# NLP Parser
npx ts-node week-02-nlp-search/nlp-parser.ts

# Database Search
npx ts-node week-03-database/search-listings.ts

# Market Stats
npx ts-node week-05-market-stats/market-agent.ts

# Orchestrator

# WhatsApp Simulation

# Email Agent

## Technologies

- TypeScript
- Python
- MySQL
- OpenAI API
- OpenClaw
- Git & GitHub

## Features Completed

- Property search
- Sold comparables
- Market statistics
- Trend analysis
- OpenClaw setup
- WhatsApp channel configuration

## Notes

- Successfully connected OpenClaw to WhatsApp.
- Verified inbound WhatsApp messages reached the gateway.
- Agent responses over WhatsApp are still being investigated.
