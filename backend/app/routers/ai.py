import time
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models.ai import AIJob, AIPrediction, AIJobStatusEnum
from app.services.ai_engine import AIEngineService
from app.services.responsibility_engine import ResponsibilityEngineService
from app.services.routing_gate import RoutingGateService
from app.schemas.ai import AIIntakeAnalysisRequest, AIIntakeAnalysisResponse

router = APIRouter(prefix="/ai", tags=["AI Engine"])

@router.post("/analyze-intake", response_model=AIIntakeAnalysisResponse)
async def analyze_intake_async_endpoint(
    req: AIIntakeAnalysisRequest,
    db: AsyncSession = Depends(get_db)
):
    start_time = time.time()
    
    # 1. NLP Intake Analysis
    analysis = AIEngineService.analyze_intake_text(req.raw_text_bn)
    
    # 2. Location & Responsibility Assignment
    lat = req.latitude or 22.3569
    lon = req.longitude or 91.7832
    resp = await ResponsibilityEngineService.match_responsibility(
        db=db,
        latitude=lat,
        longitude=lon,
        primary_category=analysis["primary_category"],
        secondary_categories=analysis["secondary_categories"]
    )
    
    # 3. Routing Gate Evaluation
    gate = await RoutingGateService.evaluate_safety_gate(
        db=db,
        confidence_score=resp["confidence_score"],
        is_hazard=analysis["is_hazard"]
    )
    
    latency_ms = int((time.time() - start_time) * 1000)
    
    # 4. Save AI Job & Prediction records
    ai_job = AIJob(
        job_type="intake_analysis",
        status=AIJobStatusEnum.COMPLETED,
        input_payload={"text": req.raw_text_bn, "lat": lat, "lon": lon},
        result_payload={"analysis": analysis, "responsibility": resp, "gate": gate},
        provider_name="bangla_nlp_baseline_onnx",
        model_version="1.2.0",
        latency_ms=latency_ms
    )
    db.add(ai_job)
    await db.flush()

    pred = AIPrediction(
        job_id=ai_job.id,
        task_name="responsibility_routing",
        predicted_label=resp["department_code"],
        confidence_score=resp["confidence_score"],
        passed_confidence_gate=gate["can_propose"],
        explanation_bn=resp["responsibility_reason_bn"]
    )
    db.add(pred)
    await db.commit()

    return AIIntakeAnalysisResponse(
        job_id=ai_job.id,
        normalized_text_bn=analysis["normalized_text"],
        detected_categories=analysis["detected_categories"],
        primary_category=analysis["primary_category"],
        secondary_categories=analysis["secondary_categories"],
        proposed_priority=analysis["proposed_priority"],
        is_hazard=analysis["is_hazard"],
        hazard_reasons=analysis["hazard_reasons"],
        extracted_entities=analysis["extracted_entities"],
        recommended_department_code=resp["department_code"],
        recommended_department_name_bn=resp["department_name_bn"],
        responsibility_rule_code=resp["responsibility_rule_code"],
        responsibility_reason_bn=resp["responsibility_reason_bn"],
        nearest_asset_id=resp["matched_asset_id"],
        nearest_asset_code=resp["matched_asset_code"],
        nearest_asset_name_bn=resp["matched_asset_name_bn"],
        matched_ward_number=resp["matched_ward_number"],
        matched_ward_name_bn=resp["matched_ward_name_bn"],
        assigned_officer_name_bn=resp["assigned_officer_name_bn"],
        assigned_officer_designation=resp["assigned_officer_designation"],
        assigned_officer_phone=resp["assigned_officer_phone"],
        confidence_score=resp["confidence_score"],
        passed_confidence_gate=gate["can_propose"],
        requires_staff_verification=not gate["can_propose"],
        latency_ms=latency_ms
    )
