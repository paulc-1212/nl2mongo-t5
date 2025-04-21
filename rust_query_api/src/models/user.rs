use std::collections::HashMap;

use chrono::{DateTime, Utc};
use bson::oid::ObjectId;
use bson::serde_helpers::{
    serialize_object_id_as_hex_string, 
    chrono_datetime_as_bson_datetime
};
use serde::{Serialize, Deserialize};
use serde_json::Value;

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct UserResponse {
    #[serde(
        serialize_with = "serialize_object_id_as_hex_string",
        rename = "_id" 
    )]
    pub id: ObjectId,
    pub name: String,
    pub email: String,
    #[serde(deserialize_with = "chrono_datetime_as_bson_datetime::deserialize")]
    pub dob: DateTime<Utc>,
    #[serde(deserialize_with = "chrono_datetime_as_bson_datetime::deserialize")]
    pub signup_date: DateTime<Utc>,
    #[serde(flatten, skip_serializing_if = "HashMap::is_empty")]
    pub extra: HashMap<String, Value>,
}