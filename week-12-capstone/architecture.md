# IDX Multi-Agent Real Estate Assistant
## Architecture Diagram

```text
                         ┌─────────────────────┐
                         │        USER         │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │ WhatsApp / Interface│
                         │      OpenClaw       │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │    ORCHESTRATOR     │
                         │ Intent Classifier   │
                         │      Week 9         │
                         └──────────┬──────────┘
                                    │
             ┌──────────────────────┼──────────────────────┐
             │                      │                      │
             ▼                      ▼                      ▼
    ┌────────────────┐    ┌────────────────┐    ┌────────────────┐
    │ Property Search│    │  Market Stats  │    │ Recommendation │
    │     Agent      │    │     Agent      │    │     Agent      │
    │   Weeks 2-4    │    │     Week 5     │    │     Week 7     │
    └───────┬────────┘    └───────┬────────┘    └───────┬────────┘
            │                     │                     │
            ▼                     ▼                ┌────┴────┐
    ┌────────────────┐    ┌────────────────┐       │         │
    │ rets_property  │    │california_sold │       ▼         ▼
    │ Active Listings│    │ Historical Sold│ rets_property  california_sold
    └────────────────┘    └────────────────┘
             │
             │
             ▼
    ┌────────────────┐
    │Semantic Search │
    │ Embeddings +   │
    │Cosine Similarity│
    │     Week 6     │
    └────────────────┘


                         ┌─────────────────────┐
                         │      RAG Agent      │
                         │       Week 8        │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │  Knowledge Sources  │
                         │                     │
                         │ Real Estate Primer  │
                         │ Trestle Metadata    │
                         │ Week 5 Summaries    │
                         │ IDX Schema Reference│
                         └─────────────────────┘


                         ┌─────────────────────┐
                         │     Email Agent     │
                         │      Week 11        │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │    Email Draft      │
                         │ pending_approval    │
                         └──────────┬──────────┘
                                    │
                              HUMAN DECISION
                              ┌─────┴─────┐
                              │           │
                              ▼           ▼
                          APPROVE       REJECT
                              │           │
                              ▼           ▼
                         Send Step      BLOCKED
```

## Request Flow

1. A user sends a natural-language real estate request.
2. The orchestrator classifies the request by intent.
3. The request is routed to the appropriate specialized agent.
4. Property-search and semantic-search functionality use `rets_property`.
5. Market analytics use `california_sold`.
6. Recommendations use listing information together with sold comparable data.
7. Knowledge questions are routed to the RAG knowledge base.
8. Responses can be formatted for the WhatsApp communication layer.
9. Email workflows create a draft first and require explicit human approval before the send step.

## Main Agents

| Agent | Purpose | Primary Data |
|---|---|---|
| Property Search Agent | Search active listings | `rets_property` |
| Market Stats Agent | Analyze market statistics and trends | `california_sold` |
| Recommendation Agent | Find similar properties and validate against comps | Both tables |
| RAG Agent | Answer grounded real estate and schema questions | Indexed documents |
| Email Agent | Create outbound email drafts with approval guardrails | Agent results |

## Safety Boundary

Outbound email actions use a human-in-the-loop approval gate.

```text
Agent generates content
        ↓
Draft created
        ↓
pending_approval
        ↓
Human reviews
      ↙     ↘
 Approve   Reject
    ↓         ↓
Send step   Block
```

No rejected email draft is allowed to proceed to the send step.