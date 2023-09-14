pub mod client;
pub mod command;
pub mod macros;
pub mod secure;
pub mod session;

use std::{io, pin::pin};

use futures_lite::{
    future::yield_now,
    io::{AsyncRead, AsyncWrite},
    Future, StreamExt,
};
use session::LocoSession;
use thiserror::Error;
use tokio::select;

pub async fn create_session_task<Fut: Future>(
    inner: impl AsyncRead + AsyncWrite,
    task_fn: impl FnOnce(LocoSession) -> Fut,
) -> Result<Fut::Output, io::Error> {
    let inner = pin!(inner);

    let (session, stream) = LocoSession::new(inner);

    let task = task_fn(session);

    let stream_task = async move {
        let mut stream = pin!(stream);

        while let Some(res) = stream.next().await {
            if let Err(err) = res {
                yield_now().await;

                return Err(err);
            }
        }

        Ok::<_, io::Error>(())
    };

    select! {
        biased;

        res = stream_task => {
            res?;

            Err(io::ErrorKind::UnexpectedEof.into())
        },

        output = task => Ok(output),
    }
}

pub type RequestResult<T> = Result<T, RequestError>;

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

#[derive(Debug, Error)]
pub enum SendError {
    #[error(transparent)]
    Serialize(#[from] bson::ser::Error),

    #[error("Session closed")]
    SessionClosed,
}

#[derive(Debug, Error)]
pub enum ResponseError {
    #[error("Session closed")]
    SessionClosed,
}
