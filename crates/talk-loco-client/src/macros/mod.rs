#[doc(hidden)]
pub mod __private;

#[macro_export]
macro_rules! impl_session {
    () => {
        compile_error!("Example usage: impl_session!(
            pub struct TestSession {
                // variant 1 (empty response)
                fn test_method1("TEST", struct TestReq;);

                // variant 2
                fn test_method2("TEST", struct TestReq;) -> TestRes;

                // variant 3
                fn test_method2("TEST", struct TestReq;) -> struct TestRes {
                    pub a: i32,
                    pub b: i32,
                };

                // variant 4 (response variants)
                fn test_method2("TEST", struct TestReq;) -> TestRes {
                    0 => {
                        struct Done {
                            pub a: i32,
                            pub b: i32,
                        }
                    }

                    1 | 2 => {
                        struct PartialDone {
                            pub a: i32,
                        }
                    }
                };
            }
        )");
    };

    (
        $(#[$meta:meta])*
        $vis:vis struct $name:ident {
            $($tt:tt)*
        }
    ) => {
        $(#[$meta])*
        #[derive(Clone, Copy)]
        $vis struct $name<'a>(pub &'a $crate::session::LocoSession);

        impl_session!(@methods $name $($tt)*);
    };

    (@methods $struct_name:ident) => {};

    // declared request type, empty response type
    (
        @methods $struct_name:ident
        $(#[$meta:meta])*
        $vis:vis fn $name:ident(
            $method:literal,
            $req_prefix:ident $req:ident $($req_tt:tt)* $(,)?
        );

        $($tt:tt)*
    ) => {
        $vis mod $name {
            pub mod request {
                $crate::macros::__private::structstruck::strike!(
                    #[strikethrough[derive(Debug, Clone, $crate::macros::__private::serde::Serialize)]]
                    pub $req_prefix $req $($req_tt)*
                );
            }
        }

        $vis use $name::request::$req;

        impl_session!(
            @methods @internal $struct_name
            $(#[$meta])*
            $vis fn $name($method, data, &$req) -> () {
                0 => Ok(())
            }

            $($tt)*
        );
    };

    // declared request type, fixed response type
    (
        @methods $struct_name:ident
        $(#[$meta:meta])*
        $vis:vis fn $name:ident(
            $method:literal,
            $req_prefix:ident $req:ident $($req_tt:tt)* $(,)?
        ) -> $res:ty;

        $($tt:tt)*
    ) => {
        $vis mod $name {
            pub mod request {
                $crate::macros::__private::structstruck::strike!(
                    #[strikethrough[derive(Debug, Clone, $crate::macros::__private::serde::Serialize)]]
                    pub $req_prefix $req $($req_tt)*
                );
            }
        }

        $vis use $name::request::$req;

        impl_session!(
            @methods @internal $struct_name
            $(#[$meta])*
            $vis fn $name($method, &$req) -> $res;

            $($tt)*
        );
    };

    // declared request type, declared response type
    (
        @methods $struct_name:ident
        $(#[$meta:meta])*
        $vis:vis fn $name:ident(
            $method:literal,
            $req_prefix:ident $req:ident $($req_tt:tt)* $(,)?
        ) -> $res_prefix:ident $res:ident $($res_tt:tt)*;

        $($tt:tt)*
    ) => {
        $vis mod $name {
            pub mod request {
                $crate::macros::__private::structstruck::strike!(
                    #[strikethrough[derive(Debug, Clone, $crate::macros::__private::serde::Serialize)]]
                    pub $req_prefix $req $($req_tt)*
                );
            }

            pub mod response {
                $crate::macros::__private::structstruck::strike!(
                    #[strikethrough[derive(Debug, Clone, $crate::macros::__private::serde::Deserialize)]]
                    pub $res_prefix $res $($res_tt)*
                );
            }
        }

        $vis use $name::{request::$req, response::$res};

        impl_session!(
            @methods $struct_name
            $(#[$meta])*
            $vis fn $name($method, $req) -> $res;

            $($tt)*
        );
    };

    // declared request type, declared response type variants
    (
        @methods $struct_name:ident
        $(#[$meta:meta])*
        $vis:vis fn $name:ident (
            $method:literal,
            $req_prefix:ident $req:ident $($req_tt:tt)* $(,)?
        ) -> $res:ident {
            $(
                $status:pat => { $variant_prefix:ident $variant_name:ident $($variant_tt:tt)* } $(,)?
            )*
        }

        $($tt:tt)*
    ) => {
        $vis mod $name {
            pub mod request {
                $crate::macros::__private::structstruck::strike!(
                    #[strikethrough[derive(Debug, Clone, $crate::macros::__private::serde::Serialize)]]
                    pub $req_prefix $req $($req_tt)*
                );
            }

            pub mod response {
                #[derive(Debug, $crate::macros::__private::serde::Deserialize)]
                pub enum $res {
                    $($variant_name($variant_name)),+
                }

                $(
                    $crate::macros::__private::structstruck::strike!(
                        #[strikethrough[derive(Debug, Clone, $crate::macros::__private::serde::Deserialize)]]
                        pub $variant_prefix $variant_name $($variant_tt)*
                    );
                )*
            }

        }

        $vis use $name::{request::$req, response::$res};

        impl_session!(
            @methods @internal $struct_name
            $(#[$meta])*
            $vis fn $name($method, data, $req) -> $res {
                $(
                    $status => Ok(
                        $res::$variant_name(
                            $crate::macros::__private::bson::from_slice(&data)?
                        )
                    )
                ),*
            }

            $($tt)*
        );
    };

    // [internal] fixed request, response type
    (
        @methods @internal $struct_name:ident
        $(#[$meta:meta])*
        $vis:vis fn $name:ident(
            $method:literal,
            $req:ty $(,)?
        ) -> $res:ty;

        $($tt:tt)*
    ) => {
        impl_session!(
            @methods @internal $struct_name
            $(#[$meta])*
            $vis fn $name($method, data, &$req) -> $res {
                0 => Ok(
                    $crate::macros::__private::bson::from_slice(&data)?
                )
            }

            $($tt)*
        );
    };

    // [internal] final
    (
        @methods @internal $struct_name:ident
        $(#[$meta:meta])*
        $vis:vis fn $name:ident($method:literal, $data:ident, $req:ty) -> $res:ty {
            $($status:pat => $expr:expr),* $(,)?
        }

        $($tt:tt)*
    ) => {
        impl $struct_name<'_> {
            $(#[$meta])*
            $vis async fn $name(
                self,
                command: &$req,
            ) -> $crate::RequestResult<$res> {
                use $crate::macros::__private::{
                    loco_protocol::command::Method,
                    bson,
                };

                let $data = self.0.request(
                    Method::new($method).unwrap(),
                    bson::to_vec(command)?,
                )
                .await.map_err(|_| $crate::RequestError::Write(::std::io::ErrorKind::UnexpectedEof.into()))?
                .await.map_err(|_| $crate::RequestError::Read(::std::io::ErrorKind::UnexpectedEof.into()))?
                .data;

                match bson::from_slice::<$crate::BsonCommandStatus>(&$data)?.status {
                    $($status => $expr,)*

                    status => Err($crate::RequestError::Status(status)),
                }
            }
        }
    };
}
