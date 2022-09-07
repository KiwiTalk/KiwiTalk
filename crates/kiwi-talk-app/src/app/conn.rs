use talk_loco_client::{
    client::{booking::BookingClient, checkin::CheckinClient},
    LocoCommandSession,
};
use talk_loco_command::{
    request::{booking::GetConfReq, checkin::CheckinReq},
    response::{booking::GetConfRes, checkin::CheckinRes},
    structs::client::ClientInfo,
};
use thiserror::Error;
use tokio_native_tls::native_tls;

use crate::error::impl_tauri_error;

use super::{
    constants::{
        BOOKING_SERVER, CHECKIN_SERVER, TALK_MCCMNC, TALK_MODEL, TALK_NET_TYPE, TALK_OS,
        TALK_USE_SUB, TALK_VERSION,
    },
    stream::{create_secure_stream, create_tls_stream, LOCO_CLIENT_SECURE_SESSION},
};

pub async fn get_conf() -> Result<GetConfRes, ConnError> {
    let mut connector = tokio_native_tls::TlsConnector::from(
        native_tls::TlsConnector::new().or(Err(ConnError::Connection))?,
    );

    let stream = create_tls_stream(&mut connector, BOOKING_SERVER.0, BOOKING_SERVER)
        .await
        .or(Err(ConnError::Connection))?;

    let (session, _) = LocoCommandSession::new(stream);
    let client = BookingClient(&session);

    let get_conf = client
        .get_conf(&GetConfReq {
            os: TALK_OS.into(),
            mccmnc: TALK_MCCMNC.into(),
            model: TALK_MODEL.into(),
        })
        .await
        .await
        .or(Err(ConnError::Stream))?;

    match get_conf.data {
        Some(data) => Ok(data),
        None => Err(ConnError::Request(get_conf.status)),
    }
}

pub async fn checkin(user_id: i64) -> Result<CheckinRes, ConnError> {
    let stream = create_secure_stream(&LOCO_CLIENT_SECURE_SESSION, CHECKIN_SERVER)
        .await
        .or(Err(ConnError::Connection))?;

    let (session, _) = LocoCommandSession::new(stream);
    let client = CheckinClient(&session);

    let checkin = client
        .checkin(&CheckinReq {
            user_id,
            client: ClientInfo {
                os: TALK_OS.into(),
                net_type: TALK_NET_TYPE,
                app_version: TALK_VERSION.into(),
                mccmnc: TALK_MCCMNC.into(),
            },
            language: "ko".into(),
            country_iso: "KR".into(),
            use_sub: TALK_USE_SUB,
        })
        .await
        .await
        .or(Err(ConnError::Stream))?;

    match checkin.data {
        Some(data) => Ok(data),
        None => Err(ConnError::Request(checkin.status)),
    }
}

#[derive(Debug, Error)]
pub enum ConnError {
    #[error("Cannot connect to server")]
    Connection,

    #[error("Stream error")]
    Stream,

    #[error("Request failed")]
    Request(i16),
}

impl_tauri_error!(ConnError);
