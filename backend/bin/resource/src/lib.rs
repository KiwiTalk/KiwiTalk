use anyhow::bail;
use dashmap::DashMap;
use serde::{Deserialize, Serialize};
use std::sync::{
    atomic::{AtomicU32, Ordering},
    Arc,
};

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct ResourceId(u32);

pub trait Resource {
    fn new_table() -> ResourceTable<Self>
    where
        Self: Sized,
    {
        ResourceTable {
            index: AtomicU32::new(0),
            map: DashMap::new(),
        }
    }
}

#[derive(Debug)]
pub struct ResourceTable<T> {
    index: AtomicU32,
    map: DashMap<ResourceId, Arc<T>>,
}

impl<T: Resource> ResourceTable<T> {
    pub fn insert(&self, value: T) -> ResourceId {
        let id = ResourceId(self.index.fetch_add(1, Ordering::AcqRel));

        self.map.insert(id, Arc::new(value));

        id
    }

    pub fn get(&self, rid: ResourceId) -> anyhow::Result<Arc<T>> {
        if let Some(res) = self.map.get(&rid) {
            Ok(res.clone())
        } else {
            bail!("bad resource id")
        }
    }

    pub fn remove(&self, rid: ResourceId) -> anyhow::Result<Arc<T>> {
        if let Some((_, res)) = self.map.remove(&rid) {
            Ok(res)
        } else {
            bail!("bad resource id")
        }
    }
}
