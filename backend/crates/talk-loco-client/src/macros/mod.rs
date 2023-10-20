#[doc(hidden)]
pub mod __private;

#[macro_export]
macro_rules! request {
    (
        $session:expr, $method:literal, { $($body:tt)* } $($tt:tt)*
    ) => {
        async {
            use $crate::macros::__private::{bson, loco_protocol};

            let data = $session.request(
                loco_protocol::command::Method::new($method).unwrap(),
                bson::rawdoc!{
                    $($body)*
                }.into_bytes(),
            )
            .await.map_err(|_| $crate::RequestError::Write(::std::io::ErrorKind::UnexpectedEof.into()))?
            .await.map_err(|_| $crate::RequestError::Read(::std::io::ErrorKind::UnexpectedEof.into()))?
            .data;

            let status = bson::from_slice::<$crate::BsonCommandStatus>(&data)?.status;

            $crate::request!(@inner(data = data, status = status) $($tt)*)
        }
    };

    (
        @inner(data = $data:ident, status = $status:ident)
        -> $ty:ty
    ) => {
        match $status {
            0 => Ok(bson::from_slice::<$ty>(&$data)?),

            status => Err::<_, $crate::RequestError>($crate::RequestError::Status(status)),
        }
    };

    (
        @inner(data = $data:ident, status = $status:ident)
        -> {
            $($code:pat => $closure:expr),* $(,)?
        }
    ) => {
        match $status {
            $($code => Ok($closure(bson::from_slice(&$data)?)),)*

            status => Err::<_, $crate::RequestError>($crate::RequestError::Status(status)),
        }
    };

    (
        @inner(data = $data:ident, status = $status:ident)
    ) => {
        match $status {
            0 => Ok(()),
            status => Err::<_, $crate::RequestError>($crate::RequestError::Status(status)),
        }
    };
}
