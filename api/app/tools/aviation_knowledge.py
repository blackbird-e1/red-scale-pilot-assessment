"""
aviation_knowledge tool — semantic search over the aviation RAG knowledge base.

The knowledge base contains:

- Flight manuals
- Standard Operating Procedures (SOP)
- Emergency procedures
- Aircraft systems documentation
- Aviation regulations
- Training manuals
- Operational guidance

Embeddings are stored in PostgreSQL using pgvector.
"""

import logging
from typing import Any

import asyncpg

from app.config import settings

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Tool function
# ---------------------------------------------------------------------------

async def aviation_knowledge(
    query: str,
    top_k: int | None = None,
) -> dict[str, Any]:
    """
    Search the aviation knowledge base for relevant context.

    Use this tool whenever the user asks about:

    - Flight manuals
    - Standard Operating Procedures (SOP)
    - Emergency procedures
    - Aircraft systems
    - Aviation regulations
    - Training documents
    - Operational guidance

    Args:
        query:
            Natural language search query.

        top_k:
            Number of documents to return.
            Defaults to settings.rag_top_k.

    Returns:
        {
            "results": [
                {
                    "content": "...",
                    "source": "...",
                    "score": 0.91
                }
            ],
            "result_count": 4
        }
    """

    k = top_k or settings.rag_top_k

    embedding = await _embed(query)

    if embedding is None:
        return {
            "error": "Failed to generate query embedding.",
            "results": [],
            "result_count": 0,
        }

    try:
        conn = await asyncpg.connect(settings.database_url)

    except Exception as exc:
        logger.error("Database connection error: %s", exc)

        return {
            "error": "Failed to connect to the knowledge base.",
            "results": [],
            "result_count": 0,
        }

    try:
        rows = await conn.fetch(
            """
            SELECT
                content,
                source,
                1 - (embedding <=> $1::vector) AS score
            FROM f1_knowledge
            ORDER BY embedding <=> $1::vector
            LIMIT $2
            """,
            str(embedding),
            k,
        )

        results = [
            {
                "content": row["content"],
                "source": row["source"],
                "score": float(row["score"]),
            }
            for row in rows
        ]

        return {
            "results": results,
            "result_count": len(results),
        }

    except Exception as exc:
        logger.error("Knowledge search failed: %s", exc)

        return {
            "error": f"Knowledge base query failed: {exc}",
            "results": [],
            "result_count": 0,
        }

    finally:
        await conn.close()


# ---------------------------------------------------------------------------
# Embedding helper
# ---------------------------------------------------------------------------

async def _embed(text: str) -> list[float] | None:
    """
    Generate an embedding for semantic search.

    NOTE:
    This currently uses OpenAI embeddings.
    It will be replaced when migrating to Groq + a free embedding model.
    """

    try:
        from openai import AsyncOpenAI

        client = AsyncOpenAI(api_key=settings.openai_api_key)

        response = await client.embeddings.create(
            model=settings.embedding_model,
            input=text,
        )

        return response.data[0].embedding

    except Exception as exc:
        logger.error("Embedding generation failed: %s", exc)
        return None