import torch
import os
from transformers import T5TokenizerFast, T5ForConditionalGeneration
from dotenv import load_dotenv

project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
dotenv_path = os.path.join(project_root, '.env')
if os.path.exists(dotenv_path):
    print(f"Loading environment variables from: {dotenv_path}")
    load_dotenv(dotenv_path=dotenv_path)
else:
    print(f"Warning: .env file not found at {dotenv_path}. Relying on system environment variables.")


MODEL_PATH = os.environ.get("MODEL_PATH")
SCHEMA_FILE = os.environ.get("SCHEMA_FILE")
DEFAULT_PREFIX = os.environ.get("MODEL_PREFIX", "translate Natural Language to MongoDB Query: ")
REQUESTED_DEVICE = os.environ.get("TORCH_DEVICE", "cpu")

model = None
tokenizer = None
schema_content = None
inference_prefix = DEFAULT_PREFIX
device = None

def load_model_and_resources():
    """Loads the T5-small model, tokenizer, and schema on startup."""
    global model, tokenizer, schema_content, device, inference_prefix

    if model is not None: 
        return

    print("--- Loading Model, Tokenizer, and Schema (Native Host - T5-small Specific) ---")
    if REQUESTED_DEVICE == "mps" and torch.backends.mps.is_available():
        device = torch.device("mps")
        print(f"Using requested device: MPS")
    elif REQUESTED_DEVICE == "cuda" and torch.cuda.is_available():
        device = torch.device("cuda")
        print(f"Using requested device: CUDA")
    else:
        if REQUESTED_DEVICE not in ["cpu", "mps", "cuda"]:
             print(f"Warning: Requested device '{REQUESTED_DEVICE}' invalid or unavailable. Falling back to CPU.")
        else:
             print(f"Using device: CPU (requested '{REQUESTED_DEVICE}' unavailable or not specified)")
        device = torch.device("cpu")

    if not SCHEMA_FILE or not os.path.exists(SCHEMA_FILE):
        raise RuntimeError(f"Schema file path not found or not set in .env: Check SCHEMA_FILE variable. Path checked: '{SCHEMA_FILE}'")
    try:
        with open(SCHEMA_FILE, 'r', encoding='utf-8') as f:
            schema_content = f.read()
        print(f"Schema loaded successfully from {SCHEMA_FILE}")
    except Exception as e:
        raise RuntimeError(f"Error loading schema from {SCHEMA_FILE}: {e}")

    if not MODEL_PATH or not os.path.isdir(MODEL_PATH):
         raise RuntimeError(f"Model directory path not found or not set in .env: Check MODEL_PATH variable. Path checked: '{MODEL_PATH}'")

    try:
        print(f"Loading T5-small model and tokenizer from: {MODEL_PATH}")

        tokenizer = T5TokenizerFast.from_pretrained(MODEL_PATH)
        model = T5ForConditionalGeneration.from_pretrained(MODEL_PATH)

        model.to(device) 
        model.eval() 
        print("Model and tokenizer loaded successfully.")

    except Exception as e:
        raise RuntimeError(f"Error loading T5 model/tokenizer from {MODEL_PATH}: {e}")

    print("--- Model loading complete ---")

def get_model():
    if model is None: load_model_and_resources()
    return model

def get_tokenizer():
    if tokenizer is None: load_model_and_resources()
    return tokenizer

def get_schema():
    if schema_content is None: load_model_and_resources()
    return schema_content

def get_device():
    if device is None: load_model_and_resources()
    return device

def get_prefix():
    if schema_content is None: load_model_and_resources()
    return inference_prefix