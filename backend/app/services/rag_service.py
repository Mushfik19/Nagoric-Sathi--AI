from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.models.service import ServiceDocument, ServiceDocumentChunk

class RAGService:
    """
    Verified-Source Retrieval Augmented Generation Engine (R&D Section 10.7).
    Strictly answers from verified government citizen charters and bylaws.
    Zero hallucination of fees, legal requirements, or deadlines.
    """

    STOP_WORDS = {"ও", "এবং", "কী", "কি", "বা", "এর", "তে", "হবে", "করে", "না", "কে", "জন্য", "কিনা", "হলে", "থেকে"}

    @classmethod
    async def query_knowledge(cls, db: AsyncSession, query_bn: str) -> Dict[str, Any]:
        raw_words = [w.strip() for w in query_bn.strip().lower().split() if len(w.strip()) > 1]
        query_words = set([w for w in raw_words if w not in cls.STOP_WORDS])
        
        # 1. Retrieve all active service document chunks
        stmt = select(ServiceDocumentChunk).options(
            selectinload(ServiceDocumentChunk.document)
        )
        res = await db.execute(stmt)
        chunks = res.scalars().all()
        
        scored_chunks = []
        if query_words:
            for chunk in chunks:
                if not chunk.document.is_active:
                    continue
                    
                content_lower = chunk.content_bn.lower()
                section_lower = (chunk.section_title or "").lower()
                
                # Match score based on non-stopword keyword overlap
                matched_count = sum(1 for w in query_words if w in content_lower or w in section_lower)
                if matched_count >= 1:
                    score = matched_count / max(1, len(query_words))
                    if score >= 0.25:
                        scored_chunks.append((score, chunk))
        
        scored_chunks.sort(key=lambda x: x[0], reverse=True)
        top_matches = scored_chunks[:3]

        if not top_matches:
            return {
                "query_bn": query_bn,
                "answer_bn": "দুঃখিত, আপনার জিজ্ঞাসার বিষয়ে কোনো যাচাইকৃত সরকারি সেবা তথ্য পাওয়া যায়নি। সঠিক নির্দেশনার জন্য সংশ্লিষ্ট ওয়ার্ড কাউন্সিলর অফিস বা ৩৩৩ হেল্পলাইনে যোগাযোগ করুন।",
                "is_verified_source_found": False,
                "citations": [],
                "disclaimer_bn": "নাগরিক সাথী এআই শুধুমাত্র সংরক্ষিত সরকারি গেজেট ও সেবা সনদপত্র থেকে তথ্য পরিবেশন করে।"
            }

        # Build answer and citations strictly from retrieved text
        citations = []
        combined_snippets = []
        for score, chunk in top_matches:
            citations.append({
                "document_title_bn": chunk.document.document_title_bn,
                "source_agency": chunk.document.source_agency,
                "applicable_area": chunk.document.applicable_area,
                "last_verified_date": chunk.document.last_verified_date.strftime("%d-%m-%Y"),
                "section_title": chunk.section_title,
                "snippet_bn": chunk.content_bn[:300] + ("..." if len(chunk.content_bn) > 300 else ""),
                "confidence": round(score, 2)
            })
            combined_snippets.append(chunk.content_bn)

        answer_text = "\n\n".join(combined_snippets)

        return {
            "query_bn": query_bn,
            "answer_bn": answer_text,
            "is_verified_source_found": True,
            "citations": citations,
            "disclaimer_bn": "উক্ত তথ্য সিটি কর্পোরেশনের অনুমোদিত সেবা সনদ থেকে সংগৃহীত। পরিবর্তনযোগ্য বিধিমালার জন্য মূল গেজেট অনুসরণীয়।"
        }
