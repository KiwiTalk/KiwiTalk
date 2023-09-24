use anyhow::Context;
use talk_loco_client::{
    client::{
        booking::{BookingClient, GetConfReq, GetConfRes},
        checkin::{CheckinClient, CheckinReq, CheckinRes},
    },
    LocoClient,
};
use tokio_native_tls::native_tls;

use super::stream::{create_secure_stream, create_tls_stream};
use crate::constants::{
    BOOKING_SERVER, CHECKIN_SERVER, TALK_MCCMNC, TALK_MODEL, TALK_NET_TYPE, TALK_OS, TALK_USE_SUB,
    TALK_VERSION,
};

pub async fn get_conf() -> anyhow::Result<GetConfRes> {
    let mut connector = tokio_native_tls::TlsConnector::from(
        native_tls::TlsConnector::new().context("cannot create tls connector")?,
    );

    let stream = create_tls_stream(&mut connector, BOOKING_SERVER.0, BOOKING_SERVER)
        .await
        .context("cannot create tls stream")?;

    let mut client = BookingClient::new(LocoClient::new(stream));

    Ok(client
        .get_conf(&GetConfReq {
            os: TALK_OS,
            mccmnc: TALK_MCCMNC,
            model: TALK_MODEL,
        })
        .await.context("booking failed")?)
}

pub async fn checkin(user_id: i64) -> anyhow::Result<CheckinRes> {
    let stream = create_secure_stream(CHECKIN_SERVER)
        .await
        .context("cannot create secure stream")?;

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
        .await
        .context("checkin failed")?)
}
