# Written Reflection

## What Worked

The strongest part of the project was building the system step by step and then connecting the pieces together.

The property search, market statistics, recommendation engine, RAG assistant, orchestrator, WhatsApp formatting, and email safety workflow were all tested individually.

The RAG assistant was especially useful because it showed how the model could answer questions using project-specific documentation instead of relying only on general model knowledge.

The email approval workflow also worked well because it clearly separated drafting from sending and blocked rejected drafts from being sent.

## What I Learned

I learned how multiple AI components can work together as a larger agentic system.

I also learned how to work with real estate datasets in MySQL, use embeddings and cosine similarity, retrieve relevant document chunks with RAG, and route different user requests to specialized agents.

A major lesson was that testing each component independently makes debugging much easier before attempting final integration.

## What I Would Change

If I continued the project, I would focus more on fully connecting the individual weekly components into one end-to-end application.

I would also improve the intent classifier so it can handle more natural and ambiguous user requests instead of relying mainly on keywords.

For production use, I would replace the local WhatsApp and email simulations with controlled live integrations, while keeping the same human-approval safety guardrails for outbound actions.

## Final Takeaway

This project helped me understand how a multi-agent AI assistant can combine databases, analytics, embeddings, RAG, communication tools, and safety controls into one system.

The biggest challenge was not building each feature separately, but making sure the different components could eventually work together reliably and safely.