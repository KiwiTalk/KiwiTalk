#[doc(hidden)]
pub mod __private;

#[macro_export]
macro_rules! impl_session {
    () => {
        compile_error!("Example usage: impl_session!(
            pub struct TestSession {
                // variant 1 (empty response)
                fn test_method1(\"TEST\", struct TestReq;);

                // variant 2
                fn test_method2(\"TEST\", struct TestReq {}) -> TestRes;

                // variant 3
                fn test_method2(\"TEST\", struct TestReq {}) -> struct TestRes {
                    pub a: i32,
                    pub b: i32,
                };

                // variant 4 (response variants)
                fn test_method2(\"TEST\", struct TestReq;) -> TestRes {
                    0 => struct Done {
                        pub a: i32,
                        pub b: i32,
                    }

                    1 | 2 => struct PartialDone {
                        pub a: i32,
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

        impl_session!(
            @internal {
                [mode = start_method]
                [struct_name = $name]
            }

            $($tt)*
        );
    };

    (
        @internal {
            [mode = start_method]
            [struct_name = $struct_name:ident]
        }
    ) => {};

    // declared request type, empty response type
    (
        @internal {
            [mode = start_method]
            [struct_name = $struct_name:ident]
        }

        $(#[$meta:meta])*
        $vis:vis fn $name:ident(
            $method:literal,
            $req_prefix:ident $req_name:ident $(<$($req_generics:tt),*>)? $(where $($req_where:tt),*)? { $($req_tt:tt)* } $(,)?
        );

        $($tt:tt)*
    ) => {
        impl_session!(
            @internal {
                [mode = expand_decl]
                [struct_name = $struct_name]
                [vis = $vis]
                [method_name = $name]
                [method = $method]
                [res = ()]
                [decl = [req = $req_prefix $req_name $(<$($req_generics),*>)? $(where $($req_where),*)? { $($req_tt)* } ]]
            }

            |data| {
                0 => Ok(())
            }

            $($tt)*
        );
    };

    // fixed request type, fixed response type
    (
        @internal {
            [mode = start_method]
            [struct_name = $struct_name:ident]
        }

        $(#[$meta:meta])*
        $vis:vis fn $name:ident(
            $method:literal,
            $req:ty $(,)?
        ) -> $res:ty;

        $($tt:tt)*
    ) => {
        impl_session!(
            @internal {
                [mode = expand_decl]
                [struct_name = $struct_name]
                [vis = $vis]
                [method_name = $name]
                [method = $method]
                [req = $req]
                [res = $res]
            }

            |data| {
                0 => Ok($crate::macros::__private::bson::from_slice(&data)?)
            }

            $($tt)*
        );
    };

    // declared request type, fixed response type
    (
        @internal {
            [mode = start_method]
            [struct_name = $struct_name:ident]
        }

        $(#[$meta:meta])*
        $vis:vis fn $name:ident(
            $method:literal,
            $req_prefix:ident $req_name:ident $(<$($req_generics:tt),*>)? $(where $($req_where:tt),*)? { $($req_tt:tt)* } $(,)?
        ) -> $res:ty;

        $($tt:tt)*
    ) => {
        impl_session!(
            @internal {
                [mode = expand_decl]
                [struct_name = $struct_name]
                [vis = $vis]
                [method_name = $name]
                [method = $method]
                [res = $res]
                [decl = [req = $req_prefix $req_name $(<$($req_generics),*>)? $(where $($req_where),*)? { $($req_tt)* }]]
            }

            |data| {
                0 => Ok($crate::macros::__private::bson::from_slice(&data)?)
            }

            $($tt)*
        );
    };

    // declared request type, declared response type
    (
        @internal {
            [mode = start_method]
            [struct_name = $struct_name:ident]
        }

        $(#[$meta:meta])*
        $vis:vis fn $name:ident(
            $method:literal,
            $req_prefix:ident $req_name:ident $(<$($req_generics:tt),*>)? $(where $($req_where:tt),*)? { $($req_tt:tt)* } $(,)?
        ) -> $res_prefix:ident $res_name:ident $(<$($res_generics:tt),*>)? $(where $($res_where:tt),*)? { $($res_tt:tt)* };

        $($tt:tt)*
    ) => {
        impl_session!(
            @internal {
                [mode = expand_decl]
                [struct_name = $struct_name]
                [vis = $vis]
                [method_name = $name]
                [method = $method]
                [decl =
                    [req = $req_prefix $req_name $(<$($req_generics),*>)? $(where $($req_where),*)? { $($req_tt)* }]
                    [res = $res_prefix $res_name $(<$($res_generics),*>)? $(where $($res_where),*)? { $($res_tt)* }]
                ]
            }

            |data| {
                0 => Ok($crate::macros::__private::bson::from_slice(&data)?)
            }

            $($tt)*
        );
    };

    // declared request type, declared response variants
    (
        @internal {
            [mode = start_method]
            [struct_name = $struct_name:ident]
        }

        $(#[$meta:meta])*
        $vis:vis fn $name:ident(
            $method:literal,
            $req_prefix:ident $req_name:ident $(<$($req_generics:tt),*>)? $(where $($req_where:tt),*)? { $($req_tt:tt)* } $(,)?
        ) -> $res_name:ident {
            $(
                $(#[$status_meta:meta])*
                $pat:pat => $variant_prefix:ident $variant_name:ident {
                    $($variant_tt:tt)*
                }
            ),* $(,)?
        };

        $($tt:tt)*
    ) => {
        impl_session!(
            @internal {
                [mode = expand_decl]
                [struct_name = $struct_name]
                [vis = $vis]
                [method_name = $name]
                [method = $method]
                [decl =
                    [req = $req_prefix $req_name $(<$($req_generics),*>)? $(where $($req_where),*)? { $($req_tt)* }]
                    [res = enum $res_name {
                        $($variant_name($variant_prefix { $($variant_tt)* })),*
                    }]
                ]
            }

            |data| {
                $(
                    $pat => Ok($res_name::$variant_name($crate::macros::__private::bson::from_slice(&data)?))
                ),*
            }

            $($tt)*
        );
    };

    (
        @internal {
            [mode = expand_decl]
            [struct_name = $struct_name:ident]
            [vis = $vis:vis]
            [method_name = $method_name:ident]
            [method = $method:literal]
            $([req = $req:ty])?
            $([res = $res:ty])?
            $([decl =
                $([req = $req_prefix:ident $req_name:ident $($req_tt:tt)*])?
                $([res = $res_prefix:ident $res_name:ident $($res_tt:tt)*])?
            ])?
        }

        $($tt:tt)*
    ) => {
        $(
            $vis mod $method_name {
                $(
                    pub mod request {
                        #[allow(unused_imports)]
                        use super::super::*;

                        $crate::macros::__private::structstruck::strike!(
                            #[strikethrough[derive(Debug, Clone, $crate::macros::__private::serde::Serialize, PartialEq)]]
                            #[strikethrough[$crate::macros::__private::serde_with::skip_serializing_none]]

                            #[doc = ::std::concat!(
                                "Request data for `",
                                ::std::stringify!($name),
                                "` method"
                            )]
                            pub $req_prefix $req_name $($req_tt)*
                        );
                    }
                )?

                $(
                    pub mod response {
                        #[allow(unused_imports)]
                        use super::super::*;

                        $crate::macros::__private::structstruck::strike!(
                            #[strikethrough[derive(Debug, Clone, $crate::macros::__private::serde::Deserialize, PartialEq)]]

                            #[doc = ::std::concat!(
                                "Response data for `",
                                ::std::stringify!($name),
                                "` method"
                            )]
                            pub $res_prefix $res_name $($res_tt)*
                        );
                    }
                )?
            }
        )?

        $(
            $($vis use $method_name::request::$req_name;)?
            $($vis use $method_name::response::$res_name;)?
        )?

        impl_session!(
            @internal {
                [mode = decl_method]
                [struct_name = $struct_name]
                [vis = $vis]
                [method_name = $method_name]
                [method = $method]
                $([req = $req])?
                $($([req = $req_name])?)?
                $([res = $res])?
                $($([res = $res_name])?)?
            }

            $($tt)*
        );
    };

    (
        @internal {
            [mode = decl_method]
            [struct_name = $struct_name:ident]
            [vis = $vis:vis]
            [method_name = $method_name:ident]
            [method = $method:literal]
            [req = $req:ty]
            [res = $res:ty]
        }

        |$data:ident| {
            $($status:pat => $expr:expr),* $(,)?
        }

        $($tt:tt)*
    ) => {
        impl<'a> $struct_name<'a> {
            $vis fn $method_name(
                self,
                req: &'a $req
            ) -> impl ::std::future::Future<Output = $crate::RequestResult<$res>> + 'a {
                use $crate::macros::__private::{
                    loco_protocol::command::Method,
                    bson,
                };

                async move {
                    let $data = self.0.request(
                        Method::new($method).unwrap(),
                        bson::to_vec(req)?,
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
        }

        impl_session!(
            @internal {
                [mode = start_method]
                [struct_name = $struct_name]
            }

            $($tt)*
        );
    };
}
