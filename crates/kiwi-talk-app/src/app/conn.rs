use loco_protocol::secure::{
    crypto::CryptoStore,
    session::{SecureClientSession, SecureHandshakeError},
    stream::SecureStream,
};
use thiserror::Error;
use tokio::{
    io,
    io::BufStream,
    net::{TcpStream, ToSocketAddrs},
};
use tokio_native_tls::{TlsConnector, TlsStream};
use tokio_util::compat::{Compat, TokioAsyncReadCompatExt};

pub type TlsTcpStream = Compat<TlsStream<BufStream<TcpStream>>>;
pub type SecureTcpStream = SecureStream<Compat<BufStream<TcpStream>>>;

pub type ConnResult<T, E> = Result<T, ConnError<E>>;

pub async fn create_tls_conn<A: ToSocketAddrs>(
    connector: &mut TlsConnector,
    domain: &str,
    addr: A,
) -> ConnResult<TlsTcpStream, tokio_native_tls::native_tls::Error> {
    let stream = connector
        .connect(domain, BufStream::new(TcpStream::connect(addr).await?))
        .await
        .map_err(|err| ConnError::Handshake(err))?;

    Ok(stream.compat())
}

pub async fn create_secure_conn<A: ToSocketAddrs>(
    session: &mut SecureClientSession,
    addr: A,
) -> ConnResult<SecureTcpStream, SecureHandshakeError> {
    let mut stream = SecureStream::new(
        CryptoStore::new(),
        BufStream::new(TcpStream::connect(addr).await?).compat(),
    );

    session
        .handshake_async(&mut stream)
        .await
        .map_err(|err| ConnError::Handshake(err))?;

    Ok(stream)
}

#[derive(Debug, Error)]
pub enum ConnError<H> {
    #[error("Cannot connect to server")]
    Stream(#[from] io::Error),
    #[error("Handshaking failed")]
    Handshake(H),
}
