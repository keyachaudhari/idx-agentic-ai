# Week 1 — OpenClaw Architecture

## Overview
OpenClaw is a multi-agent orchestration runtime that handles skill routing,
session state, channel integration, and tool execution.

## Architecture Flow
User → WhatsApp → OpenClaw Runtime → Skill Selector → Tool Execution → Memory Update → Response → User

## Key Components

### Skills
Modular capability units — each skill handles one domain:
- property_search_skill → queries rets_property
- market_stats_skill → queries california_sold
- rag_skill → answers knowledge questions
- recommendation_skill → surfaces similar listings
- email_skill → drafts and sends emails

### Channels
Communication interfaces:
- WhatsApp (primary)
- Email
- Web

### Sessions
Per-user conversation state and memory. Tracks:
- Current search filters
- Last results shown
- Conversation step

### Tools
Typed async functions the agent can call:
- getCurrentTime()
- searchListings()
- getSoldComps()
- getMarketStats()

### Memory
- Short-term: session state (in-memory Map)
- Long-term: vector storage (embeddings)

### Orchestrator
Routes incoming queries to the correct skill based on intent classification.

## Query Flow Diagram

WhatsApp Message
      ↓
OpenClaw Runtime
      ↓
Intent Classifier
      ↓
┌─────────────────────────────────────┐
│         Skill Selector              │
│  "search" → propertySearchSkill     │
│  "market" → marketStatsSkill        │
│  "knowledge" → ragSkill             │
│  "recommend" → recommendationSkill  │
└─────────────────────────────────────┘
      ↓
Tool Execution
┌─────────────────────┐
│  rets_property DB   │ ← active listings
│  california_sold DB │ ← sold comps
└─────────────────────┘
      ↓
Memory Update → Session State
      ↓
Formatted Response → WhatsApp