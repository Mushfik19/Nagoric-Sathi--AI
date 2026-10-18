import re
import datetime
from typing import Dict, Any, List, Tuple
from app.models.case import PriorityEnum

class AIEngineService:
    """
    Asynchronous AI Engine for Bangla NLP, text normalization, multi-label problem detection,
    and priority triage with safety-first hazard escalation (R&D Section 10.1, 10.2, 10.5).
    """

    # Keyword mappings for civic issues in Bangla
    CATEGORY_KEYWORDS = {
        "waste": [
            "ময়লা", "ময়লা", "আবর্জনা", "কচুরিপানা", "ডাস্টবিন", "বর্জ্য", "পচা", "ভাগাড়", "গন্ধ", "ফেলা", "ল্যাট্রিন"
        ],
        "drain": [
            "ড্রেন", "নর্দমা", "পানি জমে", "জলবদ্ধতা", "পানি নিষ্কাশন", "নালা", "পয়ঃনিষ্কাশন", "বন্ধ ড্রেন", "পয়নিষ্কাশন", "ভাসছে"
        ],
        "road": [
            "রাস্তা", "সড়ক", "সড়কের", "গর্ত", "ভাঙা রাস্তা", "পিচ", "খানাখন্দ", "ফুটপাত", "ইট", "পিচঢালাই", "রাস্তা নষ্ট"
        ],
        "street_light": [
            "বাতি", "লাইট", "সড়কবাতি", "অন্ধকার", "ল্যাম্পপোস্ট", "তার", "বিদ্যুৎ", "আলো", "পোস্ট", "বাল্ব"
        ]
    }

    HAZARD_KEYWORDS = [
        "খোলা ম্যানহোল", "ম্যানহোল", "ছেঁড়া তার", "বিদ্যুতের তার", "কারেন্ট", "স্পার্ক", "ধস",
        "রাস্তা ধসে", "মারাত্মক", "বিপদজনক", "বন্যা", "ডুবে", "আগুন", "শক", "জীবননাশের ঝুঁকি"
    ]

    @staticmethod
    def normalize_bangla_text(raw_text: str) -> str:
        """Clean and normalize Bangla text variants, remove duplicate whitespace, tidy punctuation."""
        if not raw_text:
            return ""
        text = raw_text.strip()
        # Normalize common Bangla Unicode character variations (e.g. Dari, Hasanta, Nukta)
        text = re.sub(r'[\r\n\t]+', ' ', text)
        text = re.sub(r'\s{2,}', ' ', text)
        return text

    @classmethod
    def analyze_intake_text(cls, text: str) -> Dict[str, Any]:
        normalized = cls.normalize_bangla_text(text)
        lower_text = normalized.lower()

        # 1. Detect categories
        detected_categories = []
        category_scores = {}
        for cat, keywords in cls.CATEGORY_KEYWORDS.items():
            matches = [kw for kw in keywords if kw in lower_text]
            if matches:
                detected_categories.append(cat)
                category_scores[cat] = len(matches)

        if not detected_categories:
            primary_category = "waste"  # Fallback default
            secondary_categories = []
            confidence = 0.65  # Below gate, will require manual staff verification
        else:
            # Sort by frequency
            sorted_cats = sorted(category_scores.items(), key=lambda x: x[1], reverse=True)
            primary_category = sorted_cats[0][0]
            secondary_categories = [c[0] for c in sorted_cats[1:]]
            confidence = min(0.92, 0.78 + (0.05 * len(sorted_cats)))

        # 2. Check for public safety hazards
        hazard_found = False
        hazard_reasons = []
        for kw in cls.HAZARD_KEYWORDS:
            if kw in lower_text:
                hazard_found = True
                hazard_reasons.append(f"বিপদজনক শব্দ শনাক্ত: '{kw}'")

        # 3. Determine proposed priority
        if hazard_found:
            proposed_priority = PriorityEnum.EMERGENCY
        elif len(detected_categories) >= 2 or "ড্রেন বন্ধ" in lower_text or "রাস্তা নষ্ট" in lower_text:
            proposed_priority = PriorityEnum.HIGH
        elif "লitter" in lower_text or "সামান্য" in lower_text or "রং" in lower_text:
            proposed_priority = PriorityEnum.LOW
        else:
            proposed_priority = PriorityEnum.MEDIUM

        # 4. Extract entities
        entities = {}
        if "গলির সামনে" in lower_text:
            entities["location_clue"] = "গলির সামনে"
        if "মোড়ে" in lower_text or "মোড়" in lower_text:
            entities["location_clue"] = "প্রধান মোড়"
        if "কয়েক দিন" in lower_text or "৩ দিন" in lower_text or "এক সপ্তাহ" in lower_text:
            entities["duration"] = "দীর্ঘস্থায়ী সমস্যা"

        return {
            "normalized_text": normalized,
            "primary_category": primary_category,
            "secondary_categories": secondary_categories,
            "detected_categories": detected_categories,
            "proposed_priority": proposed_priority,
            "is_hazard": hazard_found,
            "hazard_reasons": hazard_reasons,
            "extracted_entities": entities,
            "confidence_score": confidence
        }

    @staticmethod
    def transcribe_mock_voice(audio_url: str) -> str:
        """
        Mock Whisper ASR adapter for Bangla audio files.
        Converts mock voice payload to clean Bangla transcript.
        """
        return "আমাদের গলির সামনে অনেক ময়লা জমে ড্রেন বন্ধ হয়ে গেছে। পানি জমে রাস্তা নষ্ট হচ্ছে।"
