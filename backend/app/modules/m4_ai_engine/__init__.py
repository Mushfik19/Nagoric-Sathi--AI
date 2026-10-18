"""
Module 4: AI Engine & Pipeline (R&D Section 10).
Tokenization, category classification, entity extraction, and confidence gating.
"""
from app.services.ai_engine import AIEngine
from app.services.routing_gate import RoutingConfidenceGate
from app.models.ai import AIJob, AIPrediction

__all__ = ["AIEngine", "RoutingConfidenceGate", "AIJob", "AIPrediction"]
