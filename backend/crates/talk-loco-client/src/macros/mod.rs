#[doc(hidden)]
pub mod __private;

#[macro_export]
macro_rules! request {
    (
        $session:expr, $method:literal, bson { $($body:tt)* } $(, $($tt:tt)*)?
    ) => {
        request!(
            @inner
            $session,
            $method,
            $crate::macros::__private::bson::rawdoc!{ $($body)* }.into_bytes()
            $(, $($tt)*)?
        )
    };

    (
        $session:expr, $method:literal, $req:expr $(, $($tt:tt)*)?
    ) => {
        request!(
            @inner
            $session,
            $method,
            $crate::macros::__private::bson::ser::to_vec($req)?
            $(, $($tt)*)?
        )
    };

    (
        @inner
        $session:expr, $method:literal, $req:expr $(, $($tt:tt)*)?
    ) => {
        async {
            let req = $crate::macros::__private::__request($session, $method, $req).await?;

            $crate::request!(@inner(data = req.1, status = req.0) $($($tt)*)?)
        }
    };

    (
        @inner(data = $data:expr, status = $status:expr)
        $ty:ty
    ) => {
        match $status {
            0 => Ok(bson::from_slice::<$ty>(&$data)?),

            status => Err::<_, $crate::RequestError>($crate::RequestError::Status(status)),
        }
    };

    (
        @inner(data = $data:expr, status = $status:expr)
        {
            $($code:pat => $closure:expr),* $(,)?
        }
    ) => {
        match $status {
            $($code => Ok($closure(bson::from_slice(&$data)?)),)*

            status => Err::<_, $crate::RequestError>($crate::RequestError::Status(status)),
        }
    };

    (
        @inner(data = $data:expr, status = $status:expr)
    ) => {
        match $status {
            0 => Ok(()),
            status => Err::<_, $crate::RequestError>($crate::RequestError::Status(status)),
        }
    };
}
