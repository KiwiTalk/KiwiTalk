pub mod booking;
pub mod checkin;
pub mod talk;

use crate::{CommandRequest, LocoRequestSession};
use futures::{ready, Future, FutureExt};
use serde::Serialize;
use std::{
    pin::Pin,
    task::{Context, Poll},
};
use talk_loco_command::{command::BsonCommand, response::ResponseData};
use thiserror::Error;

#[derive(Debug, Error)]
pub enum ClientRequestError {
    #[error("request returned status {0}")]
    Request(i32),

    #[error("session closed before response")]
    Session,

    #[error("could not deserialize BSON data. {0}")]
    Deserialize(#[from] bson::de::Error),
}

pub type ClientRequestResult<T> = Result<T, ClientRequestError>;

#[derive(Debug)]
pub struct ClientCommandRequest(CommandRequest);

impl Future for ClientCommandRequest {
    type Output = ClientRequestResult<ResponseData>;

    fn poll(mut self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Self::Output> {
        Poll::Ready(match ready!(self.0.poll_unpin(cx)) {
            Some(res) => Ok(res),
            None => Err(ClientRequestError::Session),
        })
    }
}

/// Convenience method for requesting command asynchronously
pub async fn request_response_async(
    session: &LocoRequestSession,
    command: &BsonCommand<impl Serialize>,
) -> ClientCommandRequest {
    let req = session
        .request(BsonCommand {
            method: command.method.clone(),
            data_type: command.data_type,
            data: bson::ser::to_document(&command.data).unwrap(),
        })
        .await;

    ClientCommandRequest(req)
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
        ) -> crate::client::ClientRequestResult<$response> {
            let res = crate::client::request_response_async(
                self.0,
                &talk_loco_command::command::BsonCommand::new(std::borrow::Cow::Borrowed($method), 0, command),
            )
            .await.await?;

            if res.status == 0 {
                Ok(res.try_deserialize()?)
            } else {
                Err(crate::client::ClientRequestError::Request(res.status))
            }
        }
    };

    ($name: ident, $method: literal, $request: ty) => {
        async_client_method!($name, $method, $request => ());
    };
}

use async_client_method;
