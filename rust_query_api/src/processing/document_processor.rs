use crate::models::{BookingsResponse, UserResponse};
use actix_web::{HttpResponse, Error as ActixError};
use mongodb::bson::Document;
use serde::de::DeserializeOwned;
use serde::Serialize;
use std::fmt::Debug;
use log;

pub trait ProcessableResponse: Serialize + DeserializeOwned + Debug + Send + 'static {} 

impl ProcessableResponse for UserResponse {}
impl ProcessableResponse for BookingsResponse {}

pub fn process_documents<T>(docs: Vec<Document>) -> Result<HttpResponse, ActixError>
where
    T: ProcessableResponse, 
{
    let mut responses: Vec<T> = Vec::with_capacity(docs.len());
    let mut processing_errors: Vec<String> = Vec::new();
    let type_name = std::any::type_name::<T>();

    log::debug!("Processing {} documents into type {}", docs.len(), type_name);

    for doc in docs {
        match bson::from_document::<T>(doc.clone()) { 
            Ok(item) => responses.push(item),
            Err(e) => {
                let err_msg = format!(
                    "Failed to deserialize document into {}: {}. Skipping document.",
                    type_name, e
                );
                let doc_id = doc.get_object_id("_id").map(|id| id.to_hex()).unwrap_or_else(|_| "N/A".to_string());
                log::warn!("{} Failed doc _id: {}", err_msg, doc_id);
                processing_errors.push(err_msg);
            }
        }
    }

    log::info!("Successfully processed {} documents into {}.", responses.len(), type_name);
    Ok(HttpResponse::Ok().json(responses))
}