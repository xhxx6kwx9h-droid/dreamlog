// use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
// use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum Mood {
    Happy,
    Sad,
    Scary,
    Romantic,
    Weird,
    Neutral,
}

impl Mood {
    pub fn as_str(&self) -> &str {
        match self {
            Mood::Happy => "happy",
            Mood::Sad => "sad",
            Mood::Scary => "scary",
            Mood::Romantic => "romantic",
            Mood::Weird => "weird",
            Mood::Neutral => "neutral",
        }
    }

    pub fn from_str(s: &str) -> Option<Self> {
        match s {
            "happy" => Some(Mood::Happy),
            "sad" => Some(Mood::Sad),
            "scary" => Some(Mood::Scary),
            "romantic" => Some(Mood::Romantic),
            "weird" => Some(Mood::Weird),
            "neutral" => Some(Mood::Neutral),
            _ => None,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Dream {
    pub id: String,
    pub title: String,
    #[serde(rename = "occurredAt")]
    pub occurred_at: String,
    pub content: String,
    pub tags: Vec<String>,
    pub mood: Mood,
    pub intensity: i32,
    pub lucid: bool,
    #[serde(rename = "createdAt")]
    pub created_at: String,
    #[serde(rename = "updatedAt")]
    pub updated_at: String,
}

#[derive(Debug, Deserialize)]
pub struct ListDreamsFilter {
    pub query: Option<String>,
    pub mood: Option<String>,
    pub tags: Option<Vec<String>>,
    #[serde(rename = "dateFrom")]
    pub date_from: Option<String>,
    #[serde(rename = "dateTo")]
    pub date_to: Option<String>,
    pub day: Option<String>,
}
