"""
Module 6: Reversible Duplicates & Chronic Hotspots (R&D Section 6.4).
Spatial radius clustering, reversible merges preserving individual tracking, and hotspot advisories.
"""
from app.services.duplicate_detector import DuplicateDetector
from app.services.hotspot_analyzer import HotspotAnalyzer
from app.models.duplicate_hotspot import DuplicateCandidate, DuplicateLink, Hotspot

__all__ = ["DuplicateDetector", "HotspotAnalyzer", "DuplicateCandidate", "DuplicateLink", "Hotspot"]
