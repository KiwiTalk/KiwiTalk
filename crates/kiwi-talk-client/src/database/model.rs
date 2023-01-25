#[derive(Debug, Clone, Copy)]
pub struct FullModel<K, M> {
    pub id: K,
    pub model: M,
}

impl<K, M> FullModel<K, M> {
    pub const fn new(id: K, model: M) -> Self {
        Self { id, model }
    }
}

impl<K, M> From<(K, M)> for FullModel<K, M> {
    fn from(tup: (K, M)) -> Self {
        Self {
            id: tup.0,
            model: tup.1,
        }
    }
}
