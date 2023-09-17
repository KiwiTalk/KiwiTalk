use std::error::Error;

use talk_loco_client::{
    client::booking::{BookingClient, GetConfReq},
    LocoClient,
};
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

    let mut client = BookingClient::new(LocoClient::new(stream));

    let booking_res = client
        .get_conf(&GetConfReq {
            os: "win32",
            mccmnc: "999",
            model: "",
        })
        .await;

    println!("GETCONF response: {:?}\n", booking_res);

    Ok(())
}
