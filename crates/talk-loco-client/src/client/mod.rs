pub mod booking;
pub mod checkin;
pub mod talk;

use crate::{ResponseError, SendError};
use serde::{Deserialize, Serialize};
use thiserror::Error;

#[derive(Debug, Error)]
pub enum RequestError {
    #[error("request returned status {0}")]
    Status(i32),

    #[error(transparent)]
    Send(#[from] SendError),

    #[error(transparent)]
    Response(#[from] ResponseError),

    #[error("could not deserialize BSON data. {0}")]
    Deserialize(#[from] bson::de::Error),
}

pub type RequestResult<T> = Result<T, RequestError>;

#[derive(Debug, Serialize, Deserialize)]
pub struct BsonCommandStatus {
    pub status: i32,
}

// TODO:: customizable status check
macro_rules! async_client_method {
    (
        $(#[$meta:meta])*
        $name: ident, $method: literal, $request: ty => $response: ty
    ) => {
        $(#[$meta])*
        pub async fn $name(
            &self,
            command: &$request,
        ) -> $crate::client::RequestResult<$response> {
            let data = self.0.request(
                ::loco_protocol::command::Method::new($method).unwrap(),
                command
            ).await?.await?.data;

            let status = bson::from_slice::<$crate::client::BsonCommandStatus>(&data)?.status;

            match status {
                0 => Ok(::bson::from_slice(&data)?),

                _ => Err($crate::client::RequestError::Status(status)),
            }
        }
    };

    ($name: ident, $method: literal, $request: ty) => {
        async_client_method!($name, $method, $request => ());
    };
}

use async_client_method;
