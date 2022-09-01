pub mod resources;
pub mod status;
pub mod xvc;

use reqwest::{header, Client, RequestBuilder, Url};

use crate::{agent::TalkApiAgent, response::TalkStatusResponse, ApiResult, ApiURL};

use self::{resources::LoginData, xvc::XVCHasher};

use serde::Serialize;

/// Internal talk api wrapper for authentication
#[derive(Debug)]
pub struct TalkAuthClient<'a, Xvc> {
    pub config: AuthClientConfig<'a>,

    url: ApiURL,
    xvc_hasher: Xvc,

    client: Client,
}

impl<'a, Xvc: XVCHasher> TalkAuthClient<'a, Xvc> {
    pub fn new(config: AuthClientConfig<'a>, xvc_hasher: Xvc) -> Self {
        Self::new_with_url(
            config,
            ApiURL::new("https", "katalk.kakao.com").unwrap(),
            xvc_hasher,
        )
    }

    pub fn new_with_url(config: AuthClientConfig<'a>, url: ApiURL, xvc_hasher: Xvc) -> Self {
        Self {
            config,

            url,
            xvc_hasher,

            client: Client::new(),
        }
    }

    fn build_auth_request(&self, builder: RequestBuilder, email: &str) -> RequestBuilder {
        let user_agent = self
            .config
            .agent
            .get_user_agent(self.config.version, self.config.language);

        let mut builder = builder
            .header(header::USER_AGENT, &user_agent)
            .header(
                "A",
                &format!(
                    "{}/{}/{}",
                    self.config.agent.agent(),
                    self.config.version,
                    self.config.language
                ),
            )
            .header(header::ACCEPT, "*/*")
            .header(header::ACCEPT_LANGUAGE, self.config.language as &str)
            .header("X-VC", self.hash_auth_xvc(&user_agent, email));

        if let Some(host) = self.url.host_str() {
            builder = builder.header(header::HOST, host);
        }

        builder
    }

    fn build_url(&self, end_point: &str) -> Url {
        self.url
            .join(&format!("{}/{}", self.config.agent.agent(), end_point))
            .unwrap()
    }

    fn hash_auth_xvc(&self, user_agent: &str, email: &str) -> String {
        let full_hash = self
            .xvc_hasher
            .full_xvc_hash(self.config.device.uuid, user_agent, email);

        hex::encode(&full_hash[..8])
    }

    fn build_auth_form<'b>(&'b self, email: &'b str, password: &'b str) -> AuthRequestForm<'b> {
        AuthRequestForm {
            email,
            password,
            device_uuid: self.config.device.uuid,
            device_name: self.config.device.name,
            model_name: self.config.device.model,
        }
    }

    pub async fn login<'b>(
        &'b self,
        method: LoginMethod<'b>,
        forced: bool,
    ) -> ApiResult<TalkStatusResponse<LoginData>> {
        let response = match method {
            LoginMethod::Account(account_form) => {
                #[derive(Serialize)]
                struct LoginRequestForm<'a> {
                    #[serde(flatten)]
                    auth: AuthRequestForm<'a>,
                    forced: bool,
                }

                self.build_auth_request(
                    self.client.post(self.build_url("account/login.json")),
                    account_form.email,
                )
                .form(&LoginRequestForm {
                    auth: self.build_auth_form(account_form.email, account_form.password),
                    forced,
                })
            }

            LoginMethod::Token(token_form) => {
                #[derive(Serialize)]
                struct TokenLoginRequestForm<'a> {
                    #[serde(flatten)]
                    auth: AuthRequestForm<'a>,
                    auto_login: bool,
                    autowithlock: bool,
                    forced: bool,
                }

                self.build_auth_request(
                    self.client.post(self.build_url("account/login.json")),
                    token_form.email,
                )
                .form(&TokenLoginRequestForm {
                    auth: self.build_auth_form(token_form.email, token_form.auto_login_token),
                    auto_login: true,
                    autowithlock: token_form.locked,
                    forced,
                })
            }
        }
        .send()
        .await?;

        Ok(response.json().await?)
    }

    pub async fn request_passcode<'b>(
        &'b self,
        account_form: AccountLoginForm<'b>,
    ) -> ApiResult<TalkStatusResponse<()>> {
        let response = self
            .build_auth_request(
                self.client
                    .post(self.build_url("account/request_passcode.json")),
                account_form.email,
            )
            .form(&self.build_auth_form(account_form.email, account_form.password))
            .send()
            .await?;

        Ok(response.json().await?)
    }

    pub async fn register_device<'b>(
        &'b self,
        passcode: &str,
        account_form: AccountLoginForm<'b>,
        permanent: bool,
    ) -> ApiResult<TalkStatusResponse<()>> {
        #[derive(Serialize)]
        struct RegisterDeviceForm<'a> {
            #[serde(flatten)]
            auth: AuthRequestForm<'a>,
            passcode: &'a str,
            permanent: bool,
        }

        let response = self
            .build_auth_request(
                self.client
                    .post(self.build_url("account/register_device.json")),
                account_form.email,
            )
            .form(&RegisterDeviceForm {
                auth: self.build_auth_form(account_form.email, account_form.password),
                passcode,
                permanent,
            })
            .send()
            .await?;

        Ok(response.json().await?)
    }
}

#[derive(Serialize)]
struct AuthRequestForm<'a> {
    email: &'a str,
    password: &'a str,
    device_uuid: &'a str,
    device_name: &'a str,

    #[serde(skip_serializing_if = "Option::is_none")]
    model_name: Option<&'a str>,
}

#[derive(Debug, Clone, Copy)]
pub struct AuthClientConfig<'a> {
    pub device: AuthDeviceConfig<'a>,

    pub language: &'a str,
    pub version: &'a str,

    pub agent: TalkApiAgent<'a>,
}

#[derive(Debug, Clone, Copy)]
pub struct AuthDeviceConfig<'a> {
    pub name: &'a str,
    pub model: Option<&'a str>,
    pub uuid: &'a str,
}

#[derive(Debug, Clone, Copy)]
pub struct AccountLoginForm<'a> {
    pub email: &'a str,
    pub password: &'a str,
}

#[derive(Debug, Clone, Copy)]
pub struct TokenLoginForm<'a> {
    pub email: &'a str,
    pub auto_login_token: &'a str,

    pub locked: bool,
}

#[derive(Debug, Clone, Copy)]
pub enum LoginMethod<'a> {
    Account(AccountLoginForm<'a>),
    Token(TokenLoginForm<'a>),
}
