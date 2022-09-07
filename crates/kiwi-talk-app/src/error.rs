// TODO:: Fix ugly macro
macro_rules! impl_tauri_error {
    ($name: ident<$generics:ident>) => {
        impl<$generics> serde::Serialize for $name<$generics> {
            fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
            where
                S: serde::ser::Serializer,
            {
                serializer.serialize_str(self.to_string().as_ref())
            }
        }
    };

    ($name: ident) => {
        impl serde::Serialize for $name {
            fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
            where
                S: serde::ser::Serializer,
            {
                serializer.serialize_str(self.to_string().as_ref())
            }
        }
    };
}

pub(crate) use impl_tauri_error;
