pub mod booking;
pub mod checkin;
pub mod media;

use futures_lite::{AsyncRead, AsyncWrite};
use futures_loco_protocol::{loco_protocol::command::Method, LocoClient};
use serde::{de::DeserializeOwned, Serialize};

use crate::{BsonCommandStatus, RequestError, RequestResult};

async fn request_simple<Res: DeserializeOwned>(
    client: &mut LocoClient<impl AsyncRead + AsyncWrite + Unpin>,
    method: Method,
    req: &impl Serialize,
) -> RequestResult<Res> {
    let response = client
        .request(method, &bson::to_vec(req)?)
        .await
        .map_err(RequestError::Write)?
        .await
        .map_err(RequestError::Read)?;

    match bson::from_slice::<BsonCommandStatus>(&response.data)?.status {
        0 => Ok(bson::from_slice(&response.data)?),

        status => Err(RequestError::Status(status)),
    }
}
