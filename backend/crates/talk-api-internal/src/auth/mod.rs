pub mod status;
pub mod xvc;

use reqwest::{Client, Method, RequestBuilder, Url};
use serde_with::skip_serializing_none;

use crate::{config::Config, fill_api_headers, read_simple_response, ApiResult};

use self::xvc::XVCHasher;

use serde::{Deserialize, Serialize};

/// Internal api wrapper for authentication
#[derive(Debug, Clone)]
pub struct AuthApiBuilder<'a, Xvc> {
    base: Url,

    config: Config<'a>,
    device: Device<'a>,

    xvc_hasher: Xvc,

    client: Client,
}

impl<'a, Xvc: XVCHasher> AuthApiBuilder<'a, Xvc> {
    pub const fn new(
        base: Url,
        config: Config<'a>,
        device: Device<'a>,
        xvc_hasher: Xvc,
        client: Client,
    ) -> Self {
        Self {
            config,
            device,

            base,
            xvc_hasher,

            client,
        }
    }

    fn create_request(&self, method: Method, end_point: &str, email: &str) -> RequestBuilder {
        let user_agent = self.config.get_user_agent();

        fill_api_headers(
            self.client.request(method, self.create_url(end_point)),
            self.config,
        )
        .header("X-VC", self.hash_auth_xvc(&user_agent, email))
    }

    fn create_url(&self, end_point: &str) -> Url {
        self.base
            .join(self.config.agent.agent())
            .unwrap()
            .join(end_point)
            .unwrap()
    }

    fn hash_auth_xvc(&self, user_agent: &str, email: &str) -> String {
        let full_hash = self
            .xvc_hasher
            .full_xvc_hash(self.device.uuid, user_agent, email);

        hex::encode(&full_hash[..8])
    }

    fn build_auth_form<'b>(&'b self, email: &'b str, password: &'b str) -> AuthRequestForm<'b> {
        AuthRequestForm {
            email,
            password,
            device_uuid: self.device.uuid,
            device_name: self.device.name,
            model_name: self.device.model,
        }
    }

    pub async fn login(self, method: LoginMethod<'_>, forced: bool) -> ApiResult<LoginData> {
        let response = match method {
            LoginMethod::Account(account_form) => {
                #[derive(Serialize)]
                struct LoginRequestForm<'a> {
                    #[serde(flatten)]
                    auth: AuthRequestForm<'a>,
                    forced: bool,
                }

                self.create_request(Method::POST, "account/login.json", account_form.email)
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

                self.create_request(Method::POST, "account/login.json", token_form.email)
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

        read_simple_response(response).await
    }

    pub async fn request_passcode(self, account_form: AccountLoginForm<'_>) -> ApiResult<()> {
        let response = self
            .create_request(
                Method::POST,
                "account/request_passcode.json",
                account_form.email,
            )
            .form(&self.build_auth_form(account_form.email, account_form.password))
            .send()
            .await?;

        read_simple_response(response).await
    }

    pub async fn register_device(
        &self,
        passcode: &str,
        account_form: AccountLoginForm<'_>,
        permanent: bool,
    ) -> ApiResult<()> {
        #[derive(Serialize)]
        struct RegisterDeviceForm<'a> {
            #[serde(flatten)]
            auth: AuthRequestForm<'a>,
            passcode: &'a str,
            permanent: bool,
        }

        let response = self
            .create_request(
                Method::POST,
                "account/register_device.json",
                account_form.email,
            )
            .form(&RegisterDeviceForm {
                auth: self.build_auth_form(account_form.email, account_form.password),
                passcode,
                permanent,
            })
            .send()
            .await?;

        read_simple_response(response).await
    }
}

#[skip_serializing_none]
#[derive(Serialize)]
struct AuthRequestForm<'a> {
    email: &'a str,
    password: &'a str,
    device_uuid: &'a str,
    device_name: &'a str,

    model_name: Option<&'a str>,
}

#[derive(Debug, Clone, Copy)]
pub struct Device<'a> {
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

#[derive(Debug, Clone, Deserialize)]
pub struct LoginData {
    #[serde(rename = "userId")]
    pub user_id: u64,

    #[serde(rename = "countryIso")]
    pub country_iso: String,
    #[serde(rename = "countryCode")]
    pub country_code: String,

    #[serde(rename = "accountId")]
    pub account_id: u64,

    // pub server_time: u64,

    // #[serde(rename = "resetUserData")]
    // pub reset_user_data: bool,
    // pub story_url: Option<String>,
    pub access_token: String,
    pub refresh_token: String,
    pub token_type: String,

    #[serde(rename = "autoLoginAccountId")]
    pub auto_login_account_id: String,
    #[serde(rename = "displayAccountId")]
    pub display_account_id: String,

    #[serde(rename = "mainDeviceAgentName")]
    pub main_device_agent_name: String,
    #[serde(rename = "mainDeviceAppVersion")]
    pub main_device_app_version: String,
}
