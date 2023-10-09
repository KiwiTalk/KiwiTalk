use std::env;

use reqwest::{Client, Url};
use talk_api_internal::{
    agent::TalkApiAgent,
    auth::{
        client::{AuthClient, Device},
        xvc::default::Win32XVCHasher,
        AccountForm, Login,
    },
    client::TalkHttpClient,
    config::Config,
};

pub const DEVICE: Device = Device {
    // Device name
    name: "TEST_DEVICE",

    model: None,
    // Unique id base64 encoded. 62 bytes
    uuid:
        "OMnpb2Rq6q4goIvDM/yiHxs7ztsaGnNtjdXmFW92SODvof2BwjvJIwbP5cDp4b++fcYCBGQYy6K8Q8jGhZYzV1==",
};

pub const CONFIG: Config = Config {
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

    let auth = AuthClient::new(
        DEVICE,
        HASHER,
        TalkHttpClient::new(
            CONFIG,
            Url::parse("https://katalk.kakao.com").unwrap(),
            Client::new(),
        ),
    );

    let res = Login::request_with_account(
        auth,
        AccountForm {
            email: &args[1],
            password: &args[2],
        },
        false,
    )
    .await;

    println!("Result: {:?}", res);
}
