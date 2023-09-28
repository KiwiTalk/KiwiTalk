pub mod command;

use crate::StreamResult;
use command::Kickout;
use futures_lite::{ready, Stream};
use futures_loco_protocol::loco_protocol::command::BoxedCommand;
use std::{
    io,
    pin::Pin,
    task::{Context, Poll},
};

use self::command::{Msg, DecunRead, ChgMeta, SyncJoin, SyncDlMsg, SyncLinkCr, SyncMemT, SyncLinkPf, SyncRewr};

pin_project_lite::pin_project!(
    #[derive(Debug)]
    pub struct TalkStream<S> {
        #[pin]
        stream: S,
    }
);

impl<S> TalkStream<S> {
    pub const fn new(stream: S) -> Self {
        Self { stream }
    }

    pub fn into_inner(self) -> S {
        self.stream
    }
}

impl<S> Stream for TalkStream<S>
where
    S: Stream<Item = io::Result<BoxedCommand>>,
{
    type Item = StreamResult<StreamCommand>;

    fn poll_next(self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Option<Self::Item>> {
        Poll::Ready(
            ready!(self.project().stream.poll_next(cx)?)
                .map(|read| Ok(StreamCommand::from_command(read)?)),
        )
    }
}

macro_rules! create_enum {
    (
        $(#[$meta:meta])*
        $vis:vis enum $name:ident {
            $(
                $(#[$variant_meta:meta])*
                $method:literal => $variant_name:ident$(($variant_ty:ident))?
            ),* $(,)?
        }
    ) => {
        $(#[$meta])*
        $vis enum $name {
            $(
                $(#[$variant_meta])*
                $variant_name$(($variant_ty))?,
            )*
            
            #[doc = "Unknown command"]
            Unknown(BoxedCommand),
        }

        impl $name {
            fn from_command(command: BoxedCommand) -> ::bson::de::Result<Self> {
                Ok(match &*command.header.method {
                    $(
                        $method => StreamCommand::$variant_name$((::bson::from_slice::<$variant_ty>(&command.data)?))?,
                    )*

                    _ => StreamCommand::Unknown(command),
                })
            }
        }

        $(
            $(
                impl From<$variant_ty> for $name {
                    fn from(value: $variant_ty) -> Self {
                        Self::$variant_name(value)
                    }
                }
            )?
        )*

        impl From<BoxedCommand> for $name {
            fn from(value: BoxedCommand) -> Self {
                Self::Unknown(value)
            }
        }
    };
}

create_enum!(
    #[derive(Debug)]
    pub enum StreamCommand {
        "KICKOUT" => Kickout(Kickout),
        "CHANGESVR" => SwitchServer,

        "MSG" => Chat(Msg),
        "DECUNREAD" => ChatRead(DecunRead),
        "CHGMETA" => ChangeMeta(ChgMeta),

        "SYNCJOIN" => SyncChannelJoin(SyncJoin),
        "SYNCDLMSG" => SyncChatDeletion(SyncDlMsg),
        "SYNCREWR" => SyncRewrite(SyncRewr),

        "SYNCLINKCR" => SyncLinkCreation(SyncLinkCr),
        "SYNCMEMT" => SyncOpenUserType(SyncMemT),
        "SYNCLINKPR" => SyncLinkProfile(SyncLinkPf),
    }
);
