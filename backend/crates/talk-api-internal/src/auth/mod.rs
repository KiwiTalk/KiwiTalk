pub mod client;
pub mod status;
pub mod xvc;

use reqwest::Method;

use crate::{read_simple_response, ApiResult};

use self::{
    client::{AuthClient, Device},
    xvc::XvcHasher,
};

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, Serialize)]
pub struct AccountForm<'a> {
    pub email: &'a str,
    pub password: &'a str,
}

#[derive(Debug, Clone, Deserialize)]
pub struct Login {
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

impl Login {
    pub async fn request_with_account(
        client: AuthClient<'_, impl XvcHasher>,
        account: AccountForm<'_>,
        forced: bool,
    ) -> ApiResult<Self> {
        #[derive(Serialize)]
        struct Form<'a> {
            #[serde(flatten)]
            device: Device<'a>,

            #[serde(flatten)]
            account: AccountForm<'a>,
            forced: bool,
        }

        let form = Form {
            device: client.device,
            account,
            forced,
        };

        read_simple_response(
            client
                .request(Method::POST, "account/login.json", account.email)?
                .form(&form)
                .send()
                .await?,
        )
        .await
    }

    pub async fn request_with_token(
        client: AuthClient<'_, impl XvcHasher>,
        email: &str,
        token: &str,
        forced: bool,
        locked: bool,
    ) -> ApiResult<Self> {
        #[derive(Serialize)]
        struct Form<'a> {
            #[serde(flatten)]
            device: Device<'a>,

            email: &'a str,
            password: &'a str,
            auto_login: bool,
            autowithlock: bool,
            forced: bool,
        }

        let form = Form {
            device: client.device,
            email,
            password: token,
            auto_login: true,
            autowithlock: locked,
            forced,
        };

        read_simple_response(
            client
                .request(Method::POST, "account/login.json", email)?
                .form(&form)
                .send()
                .await?,
        )
        .await
    }
}

pub async fn request_passcode(
    client: AuthClient<'_, impl XvcHasher>,
    account: AccountForm<'_>,
) -> ApiResult<()> {
    #[derive(Serialize)]
    struct Form<'a> {
        #[serde(flatten)]
        device: Device<'a>,

        #[serde(flatten)]
        account: AccountForm<'a>,
    }

    let form = Form {
        device: client.device,
        account,
    };

    read_simple_response(
        client
            .request(Method::POST, "account/request_passcode.json", account.email)?
            .form(&form)
            .send()
            .await?,
    )
    .await
}

pub async fn register_device(
    client: AuthClient<'_, impl XvcHasher>,
    account: AccountForm<'_>,
    passcode: &str,
    permanent: bool,
) -> ApiResult<()> {
    #[derive(Serialize)]
    struct Form<'a> {
        #[serde(flatten)]
        device: Device<'a>,

        #[serde(flatten)]
        account: AccountForm<'a>,

        passcode: &'a str,
        permanent: bool,
    }

    let form = Form {
        device: client.device,
        account,
        passcode,
        permanent,
    };

    read_simple_response(
        client
            .request(Method::POST, "account/register_device.json", account.email)?
            .form(&form)
            .send()
            .await?,
    )
    .await
}
