use crate::app_state::AppState; 
use crate::models::{BookingsResponse, UserResponse}; 
use crate::processing::process_documents; 
use crate::query_request::{value_to_bson_document, QueryRequest}; 
use actix_web::{web, Error as ActixError, HttpResponse, Responder};
use futures::stream::TryStreamExt;
use mongodb::bson::Document;
use mongodb::options::FindOptions;
use mongodb::Collection;
use log;

// Maximum number of documents to return in a single find operation 
// in case the query is not filtering properly 
// we don't want to return the entire collection
const MAX_FIND_LIMIT: u64 = 1000; 

pub async fn handle_query(
    req: web::Json<QueryRequest>, 
    data: web::Data<AppState>,    
) -> Result<impl Responder, ActixError> {
    log::info!("Received query request: {:?}", req);

    let collection_name = &req.collection;
    let operation = &req.operation;
    let db = &data.db;

    match operation.as_str() {
        "find" => {
            let filter = match value_to_bson_document(&req.query) {
                Ok(doc) => doc,
                Err(e) => {
                    log::error!("Failed to convert query to BSON document: {}", e);
                    return Ok(HttpResponse::BadRequest().body(e));
                }
            };

            if filter.is_empty() {
                log::warn!("Attempted query with empty filter on collection '{}'. Rejecting.", collection_name);
                return Ok(HttpResponse::BadRequest().body(
                    "Queries with empty filters are not permitted. Please provide specific criteria."
                ));
            }

            log::debug!("Executing find on collection '{}' with filter: {:?}", collection_name, filter);

            let collection: Collection<Document> = db.collection(collection_name);
            let options = FindOptions::builder()
                .limit(Some(MAX_FIND_LIMIT as i64)).build();

            match collection.find(filter, Some(options)).await {
                Ok(cursor) => {
                    match cursor.try_collect::<Vec<Document>>().await {
                        Ok(docs) => {
                            log::info!("Query successful. Found {} documents.", docs.len());

                            match collection_name.as_str() {
                                "users" => process_documents::<UserResponse>(docs),
                                "bookings" => process_documents::<BookingsResponse>(docs),
                                _ => {
                                    log::warn!("Collection '{}' not specifically handled for typed response. Returning raw documents.", collection_name);
                                    Ok(HttpResponse::Ok().json(docs))
                                }
                            }
                        }
                        Err(e) => {
                            log::error!("Error collecting query results: {}", e);
                            Ok(HttpResponse::InternalServerError().body(format!("Error processing query results: {}", e)))
                        }
                    }
                }
                Err(e) => {
                    log::error!("MongoDB find operation failed: {}", e);
                    Ok(HttpResponse::InternalServerError().body(format!("Database query failed: {}", e)))
                }
            }
        }
        _ => {
            log::warn!("Unsupported operation requested: {}", operation);
            Ok(HttpResponse::BadRequest().body(format!("Unsupported operation: {}", operation)))
        }
    }
}