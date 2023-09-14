pub mod booking;
pub mod checkin;
pub mod talk;

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
                bson::to_vec(command)?.into_boxed_slice(),
            ).await?.await?.data;

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
