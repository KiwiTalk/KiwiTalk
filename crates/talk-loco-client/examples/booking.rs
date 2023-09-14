use std::error::Error;

use talk_loco_client::{client::booking::BookingClient, create_session_task};
use talk_loco_command::request;
use tokio::{io::BufStream, net::TcpStream};
use tokio_native_tls::native_tls;
use tokio_util::compat::TokioAsyncReadCompatExt;

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    let connector = tokio_native_tls::TlsConnector::from(native_tls::TlsConnector::new().unwrap());

    let stream = connector
        .connect(
            "booking-loco.kakao.com",
            BufStream::new(
                TcpStream::connect("booking-loco.kakao.com:443")
                    .await
                    .unwrap(),
            ),
        )
        .await
        .unwrap()
        .compat();

    create_session_task(stream, |session| async move {
        let booking_client = BookingClient(&session);

        let booking_res = booking_client
            .get_conf(&request::booking::GetConfReq {
                os: "win32".into(),
                mccmnc: "999".into(),
                model: "".into(),
            })
            .await;

        println!("GETCONF response: {:?}\n", booking_res);
    })
    .await?;

    Ok(())
}
