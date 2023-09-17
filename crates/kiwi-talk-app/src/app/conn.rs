use talk_loco_client::{
    client::{
        booking::{BookingClient, GetConfReq, GetConfRes},
        checkin::{CheckinClient, CheckinReq, CheckinRes},
    },
    LocoClient, RequestError,
};
use thiserror::Error;
use tokio_native_tls::native_tls;

use crate::error::impl_tauri_error;

use super::{
    constants::{
        BOOKING_SERVER, CHECKIN_SERVER, TALK_MCCMNC, TALK_MODEL, TALK_NET_TYPE, TALK_OS,
        TALK_USE_SUB, TALK_VERSION,
    },
    stream::{create_secure_stream, create_tls_stream},
};

pub async fn get_conf() -> Result<GetConfRes, ConnError> {
    let mut connector = tokio_native_tls::TlsConnector::from(
        native_tls::TlsConnector::new().or(Err(ConnError::Connection))?,
    );

    let stream = create_tls_stream(&mut connector, BOOKING_SERVER.0, BOOKING_SERVER)
        .await
        .or(Err(ConnError::Connection))?;

    let mut client = BookingClient::new(LocoClient::new(stream));

    Ok(client
        .get_conf(&GetConfReq {
            os: TALK_OS,
            mccmnc: TALK_MCCMNC,
            model: TALK_MODEL,
        })
        .await?)
}

pub async fn checkin(user_id: i64) -> Result<CheckinRes, ConnError> {
    let stream = create_secure_stream(CHECKIN_SERVER)
        .await
        .or(Err(ConnError::Connection))?;

    let mut client = CheckinClient::new(LocoClient::new(stream));

    Ok(client
        .checkin(&CheckinReq {
            user_id,
            os: TALK_OS,
            net_type: TALK_NET_TYPE,
            app_version: TALK_VERSION,
            mccmnc: TALK_MCCMNC,
            language: "ko",
            country_iso: "KR",
            use_sub: TALK_USE_SUB,
        })
        .await?)
}

#[derive(Debug, Error)]
pub enum ConnError {
    #[error("cannot connect to server")]
    Connection,

    #[error(transparent)]
    Request(#[from] RequestError),
}

impl_tauri_error!(ConnError);
