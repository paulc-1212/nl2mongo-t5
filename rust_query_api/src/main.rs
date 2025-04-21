use actix_web::{web, App, HttpServer};
use dotenv::dotenv;
use mongodb::Client;
use std::env;
use env_logger;
use log;

mod app_state;
mod handlers;
mod models; 
mod processing; 
mod query_request; 

use app_state::AppState;
use handlers::query::handle_query; 

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();

    env_logger::init_from_env(env_logger::Env::default().default_filter_or("info"));

    let mongo_uri = env::var("MONGODB_URI").expect("MONGODB_URI must be set");
    let db_name = env::var("DATABASE_NAME").expect("DATABASE_NAME must be set");

    log::info!("Connecting to MongoDB succesfully...");
    log::info!("Using database: {}", db_name);

    let client_options = mongodb::options::ClientOptions::parse(&mongo_uri)
        .await
        .expect("Failed to parse MongoDB URI");

    let client = Client::with_options(client_options).expect("Failed to initialize MongoDB client");

    // Optional: Uncomment to test connection
    // match client.database("admin").run_command(doc! {"ping": 1}, None).await {
    //      Ok(_) => log::info!("Successfully connected to MongoDB!"),
    //      Err(e) => {
    //          log::error!("Failed to connect to MongoDB: {}, uri: {}", e, mongo_uri);
    //          return Err(std::io::Error::new(std::io::ErrorKind::Other, format!("MongoDB connection failed: {}",e)));
    //      }
    //  }

    let db = client.database(&db_name);
    let app_state = web::Data::new(AppState { db });

    log::info!("Starting HTTP server on 0.0.0.0:8080");

    HttpServer::new(move || {
        App::new()
            .app_data(app_state.clone())
            .route("/query", web::post().to(handle_query))
    })
    .bind("0.0.0.0:8080")?
    .run()
    .await
}