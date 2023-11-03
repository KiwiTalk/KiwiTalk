use anyhow::bail;
use dashmap::DashMap;
use serde::{Deserialize, Serialize};
use std::{
    any::{Any, TypeId},
    sync::{
        atomic::{AtomicI32, Ordering},
        Arc,
    },
};
use tauri::{
    plugin::{Builder, TauriPlugin},
    Manager, Runtime,
};

pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("resource")
        .setup(|app| {
            app.manage(ResourceTable::new());

            Ok(())
        })
        .build()
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct ResourceId(i32);

#[derive(Debug)]
pub struct ResourceTable {
    index: AtomicI32,
    map: DashMap<(TypeId, ResourceId), Arc<dyn Any + Send + Sync>>,
}

impl ResourceTable {
    fn new() -> Self {
        Self {
            index: AtomicI32::new(0),
            map: DashMap::new(),
        }
    }

    pub fn insert<T: Send + Sync + 'static>(&self, value: T) -> ResourceId {
        let id = ResourceId(self.index.fetch_add(1, Ordering::AcqRel));

        self.map.insert((TypeId::of::<T>(), id), Arc::new(value));

        id
    }

    pub fn get<T: Send + Sync + 'static>(&self, id: ResourceId) -> anyhow::Result<Arc<T>> {
        if let Some(res) = self.map.get(&(TypeId::of::<T>(), id)) {
            Ok(res.clone().downcast::<T>().unwrap())
        } else {
            bail!("bad resource id")
        }
    }

    pub fn remove<T: Send + Sync + 'static>(&self, id: ResourceId) -> anyhow::Result<Arc<T>> {
        if let Some(res) = self.map.get(&(TypeId::of::<T>(), id)) {
            Ok(res.clone().downcast::<T>().unwrap())
        } else {
            bail!("bad resource id")
        }
    }
}
