"""
Module 2: Verified Service Guidance & RAG (R&D Section 7).
Strictly-grounded citizen charter question answering with zero hallucination.
"""
from app.services.rag_service import RAGService
from app.models.service import ServiceCatalog, ServiceDocument, ServiceDocumentChunk

__all__ = ["RAGService", "ServiceCatalog", "ServiceDocument", "ServiceDocumentChunk"]
