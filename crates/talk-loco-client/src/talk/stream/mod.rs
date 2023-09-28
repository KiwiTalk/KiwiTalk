pub mod command;

use std::{io, pin::pin};

use async_stream::try_stream;
use futures_lite::{Stream, StreamExt};
use futures_loco_protocol::loco_protocol::command::BoxedCommand;

use crate::StreamResult;

pub fn create_talk_stream(
    stream: impl Stream<Item = io::Result<BoxedCommand>>,
) -> impl Stream<Item = StreamResult<StreamRead>> {
    try_stream!({
        let mut stream = pin!(stream);

        while let Some(read) = stream.next().await.transpose()? {
            yield StreamRead::A;
        }
    })
}

#[derive(Debug)]
pub enum StreamRead {
    A,
}
