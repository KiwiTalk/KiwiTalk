pub mod booking;
pub mod checkin;
pub mod media;
pub mod talk;

use futures_lite::{AsyncRead, AsyncWrite};
use loco_protocol::command::Method;
use serde::{de::DeserializeOwned, Serialize};

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
        ) -> $crate::RequestResult<$response> {
            let data = self.0.request(
                ::loco_protocol::command::Method::new($method).unwrap(),
                bson::to_vec(command)?,
            ).await.map_err(
                |_| $crate::RequestError::Write(
                    ::std::io::ErrorKind::UnexpectedEof.into()
                )
            )?.await.map_err(
                |_| $crate::RequestError::Write(
                    ::std::io::ErrorKind::UnexpectedEof.into()
                )
            )?.data;

            let status = bson::from_slice::<$crate::BsonCommandStatus>(&data)?.status;

            match status {
                0 => Ok(::bson::from_slice(&data)?),

                _ => Err($crate::RequestError::Status(status)),
            }
        }
    };

    ($name: ident, $method: literal, $request: ty) => {
        async_client_method!($name, $method, $request => ());
    };
}

use async_client_method;

use crate::{BsonCommandStatus, LocoClient, RequestError, RequestResult};

pub(super) async fn request_simple<Res: DeserializeOwned>(
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
