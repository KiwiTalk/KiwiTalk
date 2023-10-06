use reqwest::{Url, Client};

use crate::credential::Credential;

#[derive(Debug)]
pub struct ProfileApi<'a> {
    base: Url,

    credential: &'a Credential,

    client: Client,
}

impl<'a> ProfileApi<'a> {
    pub fn new(
        base: Url,
        credential: &'a Credential,
        client: Client,
    ) -> Self {
        Self {
            base,

            credential,
            
            client,
        }
    }
}