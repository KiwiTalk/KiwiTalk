pub use bson;

use futures_loco_protocol::{loco_protocol::command::Method, session::LocoSession};
use serde::Deserialize;

use crate::{RequestError, RequestResult};

#[derive(Deserialize)]
struct Status {
    status: i32,
}

pub async fn __request(
    session: &LocoSession,
    method: &str,
    data: Vec<u8>,
) -> RequestResult<(i32, Box<[u8]>)> {
    let data = session
        .request(Method::new(method).unwrap(), data)
        .await
        .map_err(|_| RequestError::Write(::std::io::ErrorKind::UnexpectedEof.into()))?
        .await
        .map_err(|_| RequestError::Read(::std::io::ErrorKind::UnexpectedEof.into()))?
        .data;

    Ok((bson::from_slice::<Status>(&data)?.status, data))
}
