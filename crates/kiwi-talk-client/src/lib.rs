pub mod event;
pub mod handler;

use event::KiwiTalkClientEvent;
use futures::{AsyncRead, AsyncWrite};
use talk_loco_client::LocoCommandSession;
use tokio::sync::mpsc;

#[derive(Debug)]
pub struct KiwiTalkClient {
    session: LocoCommandSession,
    // database
}

impl KiwiTalkClient {
    pub async fn login<S: AsyncRead + AsyncWrite + Send + Unpin + 'static>(
        stream: S,
        credential: ClientCredential<'_>,
    ) -> (Self, KiwiTalkClientEventReceiver) {
        todo!()
    }
}

#[derive(Debug)]
pub struct KiwiTalkClientEventReceiver(mpsc::Receiver<KiwiTalkClientEvent>);

impl KiwiTalkClientEventReceiver {
    #[inline]
    pub async fn recv(&mut self) -> Option<KiwiTalkClientEvent> {
        self.0.recv().await
    }
}

#[derive(Debug)]
pub struct ClientCredential<'a> {
    pub access_token: &'a str,
    pub device_uuid: &'a str,
    pub user_id: Option<u64>,
}
