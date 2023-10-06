use std::env;

use reqwest::{Client, Url};
use talk_api_internal::{
    agent::TalkApiAgent,
    auth::{
        xvc::default::Win32XVCHasher, AccountLoginForm, AuthClientConfig, AuthDeviceConfig,
        LoginMethod, AuthApi,
    },
};

pub const CONFIG: AuthClientConfig = AuthClientConfig {
    device: AuthDeviceConfig {
        // Device name
        name: "TEST_DEVICE",

        model: None,
        // Unique id base64 encoded. 62 bytes
        uuid: "OMnpb2Rq6q4goIvDM/yiHxs7ztsaGnNtjdXmFW92SODvof2BwjvJIwbP5cDp4b++fcYCBGQYy6K8Q8jGhZYzV1==",
    },
    // lang
    language: "ko",
    // Talk client version
    version: "3.2.8",
    // Talk agent
    agent: TalkApiAgent::Win32("10.0"),
};

// XVC hasher
pub const HASHER: Win32XVCHasher = Win32XVCHasher("JAYDEN", "JAYMOND");

#[tokio::main]
async fn main() {
    let args: Vec<String> = env::args().collect();
    if args.len() < 3 {
        println!(
            "Usage: {} <email> <password>",
            args.get(0).unwrap_or(&String::new())
        );
        return;
    }

    let auth_client = AuthApi::new(
        CONFIG,
        Url::parse("https://katalk.kakao.com").unwrap(),
        HASHER,
        Client::new(),
    );

    let login_form = LoginMethod::Account(AccountLoginForm {
        email: &args[1],
        password: &args[2],
    });

    let res = auth_client
        .login(
            login_form, // Force login
            true,
        )
        .await;

    println!("Result: {:?}", res);
}
