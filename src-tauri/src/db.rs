use sqlx::sqlite::{SqlitePool, SqlitePoolOptions, SqliteConnectOptions};
use std::str::FromStr;
use crate::models::{Dream, ListDreamsFilter};
use chrono::Utc;

pub struct Database {
    pool: SqlitePool,
}

impl Database {
    pub async fn new(db_path: &str) -> Result<Self, sqlx::Error> {
        let connect_options = SqliteConnectOptions::from_str(db_path)?
            .create_if_missing(true);

        let pool = SqlitePoolOptions::new()
            .max_connections(5)
            .connect_with(connect_options)
            .await?;

        let db = Database { pool };
        db.init().await?;
        Ok(db)
    }

    async fn init(&self) -> Result<(), sqlx::Error> {
        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS dreams (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                occurred_at TEXT NOT NULL,
                content TEXT NOT NULL,
                tags TEXT NOT NULL,
                mood TEXT NOT NULL,
                intensity INTEGER NOT NULL,
                lucid INTEGER NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
            "#,
        )
        .execute(&self.pool)
        .await?;

        Ok(())
    }

    pub async fn list_dreams(&self, filter: ListDreamsFilter) -> Result<Vec<Dream>, sqlx::Error> {
        let mut query = String::from(
            "SELECT id, title, occurred_at, content, tags, mood, intensity, lucid, created_at, updated_at FROM dreams WHERE 1=1"
        );
        let mut params: Vec<String> = Vec::new();

        if let Some(search) = &filter.query {
            query.push_str(" AND (title LIKE ? OR content LIKE ?)");
            let search_param = format!("%{}%", search);
            params.push(search_param.clone());
            params.push(search_param);
        }

        if let Some(mood) = &filter.mood {
            query.push_str(" AND mood = ?");
            params.push(mood.clone());
        }

        if let Some(tags) = &filter.tags {
            for tag in tags {
                query.push_str(" AND tags LIKE ?");
                params.push(format!("%\"{}\"% ", tag));
            }
        }

        if let Some(date_from) = &filter.date_from {
            query.push_str(" AND occurred_at >= ?");
            params.push(date_from.clone());
        }

        if let Some(date_to) = &filter.date_to {
            query.push_str(" AND occurred_at <= ?");
            params.push(date_to.clone());
        }

        if let Some(day) = &filter.day {
            query.push_str(" AND DATE(occurred_at) = ?");
            params.push(day.clone());
        }

        query.push_str(" ORDER BY occurred_at DESC");

        let mut q = sqlx::query_as::<_, (String, String, String, String, String, String, i32, i32, String, String)>(
            &query
        );

        for param in params {
            q = q.bind(param);
        }

        let rows = q.fetch_all(&self.pool).await?;
        let dreams = rows
            .into_iter()
            .map(|(id, title, occurred_at, content, tags, mood, intensity, lucid, created_at, updated_at)| {
                Dream {
                    id,
                    title,
                    occurred_at,
                    content,
                    tags: serde_json::from_str(&tags).unwrap_or_default(),
                    mood: crate::models::Mood::from_str(&mood).unwrap_or(crate::models::Mood::Neutral),
                    intensity,
                    lucid: lucid != 0,
                    created_at,
                    updated_at,
                }
            })
            .collect();

        Ok(dreams)
    }

    pub async fn get_dream(&self, id: &str) -> Result<Option<Dream>, sqlx::Error> {
        let row = sqlx::query_as::<_, (String, String, String, String, String, String, i32, i32, String, String)>(
            "SELECT id, title, occurred_at, content, tags, mood, intensity, lucid, created_at, updated_at FROM dreams WHERE id = ?"
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await?;

        Ok(row.map(|(id, title, occurred_at, content, tags, mood, intensity, lucid, created_at, updated_at)| {
            Dream {
                id,
                title,
                occurred_at,
                content,
                tags: serde_json::from_str(&tags).unwrap_or_default(),
                mood: crate::models::Mood::from_str(&mood).unwrap_or(crate::models::Mood::Neutral),
                intensity,
                lucid: lucid != 0,
                created_at,
                updated_at,
            }
        }))
    }

    pub async fn upsert_dream(&self, dream: Dream) -> Result<Dream, sqlx::Error> {
        let tags_json = serde_json::to_string(&dream.tags).unwrap_or_else(|_| "[]".to_string());
        let now = Utc::now().to_rfc3339();

        sqlx::query(
            "INSERT OR REPLACE INTO dreams (id, title, occurred_at, content, tags, mood, intensity, lucid, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
        )
        .bind(&dream.id)
        .bind(&dream.title)
        .bind(&dream.occurred_at)
        .bind(&dream.content)
        .bind(&tags_json)
        .bind(dream.mood.as_str())
        .bind(dream.intensity)
        .bind(if dream.lucid { 1 } else { 0 })
        .bind(&dream.created_at)
        .bind(&now)
        .execute(&self.pool)
        .await?;

        Ok(Dream {
            updated_at: now,
            ..dream
        })
    }

    pub async fn delete_dream(&self, id: &str) -> Result<(), sqlx::Error> {
        sqlx::query("DELETE FROM dreams WHERE id = ?")
            .bind(id)
            .execute(&self.pool)
            .await?;

        Ok(())
    }

    pub async fn export_json(&self) -> Result<String, Box<dyn std::error::Error>> {
        let dreams = self.list_dreams(ListDreamsFilter {
            query: None,
            mood: None,
            tags: None,
            date_from: None,
            date_to: None,
            day: None,
        }).await?;

        let json = serde_json::to_string_pretty(&dreams)?;
        Ok(json)
    }

    pub async fn import_json(&self, json: &str) -> Result<(usize, usize), Box<dyn std::error::Error>> {
        let dreams: Vec<Dream> = serde_json::from_str(json)?;
        let mut imported = 0;
        let mut updated = 0;

        for dream in dreams {
            if self.get_dream(&dream.id).await?.is_some() {
                updated += 1;
            } else {
                imported += 1;
            }
            self.upsert_dream(dream).await?;
        }

        Ok((imported, updated))
    }

    pub async fn seed_initial_data(&self) -> Result<(), sqlx::Error> {
        let count: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM dreams")
            .fetch_one(&self.pool)
            .await?;

        if count.0 == 0 {
            let now = Utc::now().to_rfc3339();
            let dreams = vec![
                Dream {
                    id: uuid::Uuid::new_v4().to_string(),
                    title: "Flying Over Mountains".to_string(),
                    occurred_at: "2024-01-25T08:30:00Z".to_string(),
                    content: "I was soaring through the air, gliding effortlessly over snow-capped mountains. The wind felt cool on my face and I could see an endless landscape below me.".to_string(),
                    tags: vec!["adventure".to_string(), "freedom".to_string()],
                    mood: crate::models::Mood::Happy,
                    intensity: 4,
                    lucid: true,
                    created_at: now.clone(),
                    updated_at: now.clone(),
                },
                Dream {
                    id: uuid::Uuid::new_v4().to_string(),
                    title: "Lost in an Old Library".to_string(),
                    occurred_at: "2024-01-24T06:00:00Z".to_string(),
                    content: "I wandered through an endless library filled with books I'd never seen before. The shelves stretched into darkness and I couldn't find the exit.".to_string(),
                    tags: vec!["mystery".to_string(), "confusion".to_string()],
                    mood: crate::models::Mood::Weird,
                    intensity: 3,
                    lucid: false,
                    created_at: now.clone(),
                    updated_at: now.clone(),
                },
                Dream {
                    id: uuid::Uuid::new_v4().to_string(),
                    title: "Dancing Under Starlight".to_string(),
                    occurred_at: "2024-01-23T07:45:00Z".to_string(),
                    content: "A beautiful night under the stars where I danced with someone close to me. Everything felt perfect and the music was entrancing.".to_string(),
                    tags: vec!["romance".to_string(), "music".to_string()],
                    mood: crate::models::Mood::Romantic,
                    intensity: 5,
                    lucid: false,
                    created_at: now.clone(),
                    updated_at: now,
                },
            ];

            for dream in dreams {
                self.upsert_dream(dream).await?;
            }
        }

        Ok(())
    }
}
