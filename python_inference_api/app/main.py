from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel, Field
import torch
import time
from contextlib import asynccontextmanager
from typing import Dict, Optional

from .model_loader import load_model_and_resources, get_model, get_tokenizer, get_schema, get_device, get_prefix
from .parser import parse_linearized_query

class QueryRequest(BaseModel):
    nlq: str = Field(..., description="Natural Language Query input")
    max_new_tokens: int = Field(256, ge=10, description="Maximum number of new tokens to generate")
    num_beams: int = Field(5, ge=1, description="Number of beams for beam search (1 = greedy)")

class ParsedQuery(BaseModel):
    collection: Optional[str] = None 
    operation: Optional[str] = None  
    query: Optional[Dict] = None

class QueryResponse(BaseModel):
    nlq: str
    generated_linear_mlq: str
    parsed_query: Optional[ParsedQuery] = None 
    processing_time_ms: float

class ErrorResponse(BaseModel):
    detail: str

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("API starting up... Loading model...")
    try:
        load_model_and_resources()
        print("Model loading sequence initiated successfully via lifespan.")
    except Exception as e:
        print(f"FATAL ERROR DURING STARTUP: Failed to load model/resources: {e}")
    yield
    print("API shutting down...")

app = FastAPI(
    title="NL-to-MongoDB Inference API",
    description="API to convert Natural Language Queries to a linearized MongoDB query format.",
    version="0.2.0",
    lifespan=lifespan
)

@app.post(
    "/predict",
    response_model=QueryResponse,
    responses={
        status.HTTP_500_INTERNAL_SERVER_ERROR: {"model": ErrorResponse},
        status.HTTP_400_BAD_REQUEST: {"model": ErrorResponse},
    }
)
async def predict_query(request: QueryRequest):
    start_time = time.time()

    try:
        model = get_model()
        tokenizer = get_tokenizer()
        schema_content = get_schema()
        device = get_device()
        prefix = get_prefix()
    except Exception as e:
         raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Model components not available: {e}"
        )

    input_text = f"{prefix}Schema: {schema_content.strip()} NLQ: {request.nlq.strip()}"

    try:
        inputs = tokenizer(input_text, return_tensors="pt", max_length=512, truncation=True, padding=True)
        input_ids = inputs.input_ids.to(device)
        attention_mask = inputs.attention_mask.to(device)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error during tokenization: {e}"
        )

    generated_linear_mlq = "" 
    try:
        with torch.no_grad():
             outputs = model.generate(
                 input_ids=input_ids,
                 attention_mask=attention_mask,
                 max_new_tokens=request.max_new_tokens,
                 num_beams=request.num_beams,
                 early_stopping=True,
             )
        generated_linear_mlq = tokenizer.decode(outputs[0], skip_special_tokens=True)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error during model generation: {e}"
        )

    parsed_output_dict = parse_linearized_query(generated_linear_mlq)
    parsed_query_model = None
    if parsed_output_dict:
        try:
            parsed_query_model = ParsedQuery(**parsed_output_dict)
        except Exception as pydantic_error:
             print(f"Pydantic validation error for parsed output: {pydantic_error}")
             print(f"Parsed Dict was: {parsed_output_dict}")

    end_time = time.time()
    processing_time = (end_time - start_time) * 1000 # ms

    return QueryResponse(
        nlq=request.nlq,
        generated_linear_mlq=generated_linear_mlq,
        parsed_query=parsed_query_model,
        processing_time_ms=processing_time
    )

@app.get("/health", status_code=status.HTTP_200_OK)
async def health_check():
    try:
        get_model()
        get_tokenizer()
        get_schema()
        return {"status": "ok"}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=f"Service unhealthy: {e}")