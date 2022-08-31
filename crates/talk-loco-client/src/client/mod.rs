pub mod booking;
pub mod checkin;
pub mod talk;

use crate::{CommandRequest, LocoCommandSession, RequestError};
use futures::{ready, Future, FutureExt};
use serde::{de::DeserializeOwned, Serialize};
use std::{
    marker::PhantomData,
    pin::Pin,
    task::{Context, Poll},
};
use talk_loco_command::command::BsonCommand;

#[derive(Debug)]
pub enum ClientRequestError {
    Request(RequestError),
    Deserialize(bson::de::Error),
}

impl From<RequestError> for ClientRequestError {
    fn from(err: RequestError) -> Self {
        Self::Request(err)
    }
}

impl From<bson::de::Error> for ClientRequestError {
    fn from(err: bson::de::Error) -> Self {
        Self::Deserialize(err)
    }
}

pub type ClientRequestResult<D> = Result<BsonCommand<D>, ClientRequestError>;

#[derive(Debug)]
pub struct ClientCommandRequest<D>(CommandRequest, PhantomData<D>);

impl<D: DeserializeOwned + Unpin> Future for ClientCommandRequest<D> {
    type Output = ClientRequestResult<D>;

    fn poll(mut self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Self::Output> {
        Poll::Ready(match ready!(self.0.poll_unpin(cx)) {
            Ok(res) => Ok(BsonCommand::<D> {
                method: res.method,
                data_type: res.data_type,
                data: bson::from_document(res.data)?,
            }),
            Err(_) => Err(ClientRequestError::Request(RequestError::Read)),
        })
    }
}

/// Convenience method for requesting command asynchronously
pub async fn request_response_async<D: DeserializeOwned>(
    session: &LocoCommandSession,
    command: &BsonCommand<impl Serialize>,
) -> ClientCommandRequest<D> {
    let req = session
        .send(BsonCommand {
            method: command.method.clone(),
            data_type: command.data_type,
            data: bson::ser::to_document(&command.data).unwrap(),
        })
        .await;

    ClientCommandRequest(req, PhantomData)
}

macro_rules! async_client_method {
    (
        $(#[$meta:meta])*
        $name: ident, $method: literal, $request: ty => $response: ty
    ) => {
        $(#[$meta])*
        pub async fn $name(
            &self,
            command: &$request,
        ) -> crate::client::ClientCommandRequest<$response> {
            crate::client::request_response_async(
                self.0,
                &talk_loco_command::command::BsonCommand::new(std::borrow::Cow::Borrowed($method), 0, command),
            )
            .await
        }
    };

    ($name: ident, $method: literal, $request: ty) => {
        async_client_method!($name, $method, $request => ());
    };
}

use async_client_method;
