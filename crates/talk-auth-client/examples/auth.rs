use std::{borrow::Cow, env};

use talk_api_client::{
    agent::TalkApiAgent,
    auth::{
        xvc::default::Win32XVCHasher, AccountLoginForm, AuthClientConfig, AuthDeviceConfig,
        LoginMethod, TalkAuthClient,
    },
};

pub const CONFIG: AuthClientConfig = AuthClientConfig::new_const(
    AuthDeviceConfig::new_const_pc(
        // Device name
        "TEST_DEVICE",
        // Unique id base64 encoded. 62 bytes
        "OMnpb2Rq6q4goIvDM/yiHxs7ztsaGnNtjdXmFW92SODvof2BwjvJIwbP5cDp4b++fcYCBGQYy6K8Q8jGhZYzV1==",
    ),
    // lang
    "ko",
    // Talk client version
    "3.2.8",
    // Talk agent
    TalkApiAgent::Win32(Cow::Borrowed("10.0")),
);

// XVC hasher
pub const HASHER: Win32XVCHasher = Win32XVCHasher::new_const("JAYDEN", "JAYMOND");

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

    let auth_client = TalkAuthClient::new(CONFIG, HASHER);

    let login_form = LoginMethod::Account(AccountLoginForm {
        email: Cow::Borrowed(&args[1]),
        password: Cow::Borrowed(&args[2]),
    });

    let res = auth_client
        .login(
            &login_form,
            // Force login
            true,
        )
        .await;

    println!("Result: {:?}", res);
}
