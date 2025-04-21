use serde::Deserialize;
use serde_json::Value;
use mongodb::bson::{self, Bson, Document}; 

#[derive(Deserialize, Debug)]
pub struct QueryRequest {
    pub collection: String, 
    pub operation: String, 
    pub query: Value,  
}

pub fn value_to_bson_document(value: &Value) -> Result<Document, String> {
    let bson_val = bson::to_bson(value)
        .map_err(|e| format!("Failed to convert JSON Value to BSON: {}", e))?;

    if let Bson::Document(doc) = bson_val {
        Ok(doc)
    } else {
        Err(format!("Expected JSON object for query, but got: {:?}", value))
    }
}