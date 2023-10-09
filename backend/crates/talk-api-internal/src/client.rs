use crate::{config::Config, credential::Credential, RequestResult};
use reqwest::{header, Client, Method, Request, RequestBuilder};
use url::Url;

#[derive(Debug, Clone)]
pub struct ApiClient<'a> {
    credential: Credential<'a>,
    inner: TalkHttpClient<'a>,
}

impl<'a> ApiClient<'a> {
    pub const fn new(credential: Credential<'a>, inner: TalkHttpClient<'a>) -> Self {
        Self { credential, inner }
    }

    pub fn request(self, method: Method, end_point: &str) -> RequestResult<RequestBuilder> {
        Ok(self.inner.request(method, end_point)?.header(
            header::AUTHORIZATION,
            format!(
                "{}-{}",
                self.credential.access_token, self.credential.device_uuid
            ),
        ))
    }
}

#[derive(Debug, Clone)]
pub struct TalkHttpClient<'a> {
    pub config: Config<'a>,
    url: Url,
    client: Client,
}

impl<'a> TalkHttpClient<'a> {
    pub const fn new(config: Config<'a>, url: Url, client: Client) -> Self {
        Self {
            config,
            url,
            client,
        }
    }

    pub fn request(self, method: Method, end_point: &str) -> RequestResult<RequestBuilder> {
        let user_agent = self.config.get_user_agent();

        let url = self
            .url
            .join(&format!("{}/{}", self.config.agent.agent(), end_point))?;

        let host = url.host_str().map(ToString::to_string);

        let mut builder = RequestBuilder::from_parts(self.client, Request::new(method, url))
            .header(header::USER_AGENT, user_agent)
            .header(
                "A",
                format!(
                    "{}/{}/{}",
                    self.config.agent.agent(),
                    self.config.version,
                    self.config.language
                ),
            )
            .header(header::ACCEPT, "*/*")
            .header(header::ACCEPT_LANGUAGE, self.config.language);

        if let Some(host) = host {
            builder = builder.header(header::HOST, host);
        }

        Ok(builder)
    }
}
