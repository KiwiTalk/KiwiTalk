pub mod command;

use self::command::{
    ChgMeta, DecunRead, DelMem, Left, Msg, NewMem, SyncDlMsg, SyncJoin, SyncLinkCr, SyncLinkPf,
    SyncMemT, SyncRewr,
};
use command::Kickout;
use futures_loco_protocol::loco_protocol::command::BoxedCommand;

macro_rules! create_enum {
    (
        $(#[$meta:meta])*
        $vis:vis enum $name:ident {
            $(
                $(#[$variant_meta:meta])*
                $method:literal => $variant_name:ident$(($variant_ty:ty))?
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
            pub fn deserialize_from(command: BoxedCommand) -> ::bson::de::Result<Self> {
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

        "LEFT" => Left(Left),

        "NEWMEM" => NewUser(NewMem),
        "DELMEM" => DelUser(DelMem),
    }
);
