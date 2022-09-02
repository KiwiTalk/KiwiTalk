pub mod conn;
pub mod constants;
pub mod event;

use event::KiwiTalkClientEvent;
use lazy_static::lazy_static;
use rsa::{RsaPublicKey, pkcs8::FromPublicKey};
use talk_loco_client::LocoCommandSession;
use tokio::sync::mpsc::Receiver;

lazy_static! {
    pub(crate) static ref LOCO_PUBLIC_KEY: RsaPublicKey = {
        RsaPublicKey::from_public_key_der(
            &pem::parse(include_str!("loco_public_key.pub"))
                .unwrap()
                .contents,
        )
        .unwrap()
    };
}

#[derive(Debug)]
pub struct KiwiTalkClient {
    session: LocoCommandSession,
    // database
}

impl KiwiTalkClient {
    pub async fn login(credential: ClientCredential<'_>) -> (Self, KiwiTalkClientEventReceiver) {
        todo!()
    }
}

#[derive(Debug)]
pub struct KiwiTalkClientEventReceiver(Receiver<KiwiTalkClientEvent>);

impl KiwiTalkClientEventReceiver {
    #[inline]
    pub async fn next(&mut self) -> Option<KiwiTalkClientEvent> {
        self.0.recv().await
    }
}

#[derive(Debug)]
pub struct ClientCredential<'a> {
    pub access_token: &'a str,
    pub device_uuid: &'a str,
    pub user_id: Option<u64>,
}
