use talk_loco_client::LocoBroadcastReceiver;
use tokio::sync::mpsc;

use crate::event::KiwiTalkClientEvent;

#[derive(Debug)]
pub struct KiwiTalkClientHandler {
    receiver: LocoBroadcastReceiver,
    event_sender: mpsc::Sender<KiwiTalkClientEvent>,
}

impl KiwiTalkClientHandler {
    pub async fn run(
        receiver: LocoBroadcastReceiver,
        event_sender: mpsc::Sender<KiwiTalkClientEvent>,
    ) {
        let mut handler = KiwiTalkClientHandler {
            receiver,
            event_sender,
        };

        while let Some(Ok(read)) = handler.receiver.recv().await {}
    }

    pub async fn emit(&mut self, event: KiwiTalkClientEvent) {
        self.event_sender.send(event).await.ok();
    }
}
