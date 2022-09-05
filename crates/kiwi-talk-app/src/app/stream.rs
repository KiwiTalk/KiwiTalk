use loco_protocol::secure::{
    crypto::CryptoStore,
    session::{SecureClientSession, SecureHandshakeError},
    stream::SecureStream,
};
use once_cell::sync::Lazy;
use rsa::{pkcs8::FromPublicKey, RsaPublicKey};
use thiserror::Error;
use tokio::{
    io,
    io::BufStream,
    net::{TcpStream, ToSocketAddrs},
};
use tokio_native_tls::{TlsConnector, TlsStream};
use tokio_util::compat::{Compat, TokioAsyncReadCompatExt};

use crate::error::impl_tauri_error;

pub static LOCO_CLIENT_SECURE_SESSION: Lazy<SecureClientSession> = Lazy::new(|| {
    SecureClientSession::new(
        RsaPublicKey::from_public_key_der(
            &pem::parse(include_str!("loco_public_key.pub"))
                .unwrap()
                .contents,
        )
        .unwrap(),
    )
});

pub type TlsTcpStream = Compat<TlsStream<BufStream<TcpStream>>>;
pub type SecureTcpStream = SecureStream<Compat<BufStream<TcpStream>>>;

pub type StreamResult<T, H> = Result<T, ConnectError<H>>;

pub async fn create_tls_stream<A: ToSocketAddrs>(
    connector: &mut TlsConnector,
    domain: &str,
    addr: A,
) -> StreamResult<TlsTcpStream, tokio_native_tls::native_tls::Error> {
    let stream = connector
        .connect(domain, BufStream::new(TcpStream::connect(addr).await?))
        .await
        .map_err(|err| ConnectError::Handshake(err))?;

    Ok(stream.compat())
}

pub async fn create_secure_stream<A: ToSocketAddrs>(
    session: &SecureClientSession,
    addr: A,
) -> StreamResult<SecureTcpStream, SecureHandshakeError> {
    let mut stream = SecureStream::new(
        CryptoStore::new(),
        BufStream::new(TcpStream::connect(addr).await?).compat(),
    );

    session
        .handshake_async(&mut stream)
        .await
        .map_err(|err| ConnectError::Handshake(err))?;

    Ok(stream)
}

#[derive(Debug, Error)]
pub enum ConnectError<H> {
    #[error("Cannot connect to server")]
    Stream(#[from] io::Error),
    #[error("Handshaking failed")]
    Handshake(H),
}

impl_tauri_error!(ConnectError<H>);
