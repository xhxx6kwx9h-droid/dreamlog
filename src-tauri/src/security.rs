use argon2::{Argon2, PasswordHasher};
use argon2::password_hash::{SaltString, PasswordHash, PasswordVerifier};
// use rand::Rng;

pub struct PinManager;

impl PinManager {
    pub fn hash_pin(pin: &str) -> Result<String, String> {
        let salt = SaltString::generate(rand::thread_rng());
        let argon2 = Argon2::default();
        let password_hash = argon2
            .hash_password(pin.as_bytes(), &salt)
            .map_err(|e| e.to_string())?
            .to_string();
        Ok(password_hash)
    }

    pub fn verify_pin(pin: &str, hash: &str) -> Result<bool, String> {
        let parsed_hash = PasswordHash::new(hash)
            .map_err(|e| e.to_string())?;
        let argon2 = Argon2::default();
        match argon2.verify_password(pin.as_bytes(), &parsed_hash) {
            Ok(_) => Ok(true),
            Err(_) => Ok(false),
        }
    }
}
