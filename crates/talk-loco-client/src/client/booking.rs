use talk_loco_command::{request, response};

use crate::LocoRequestSession;

use super::async_client_method;

#[derive(Debug)]
pub struct BookingClient<'a>(pub &'a LocoRequestSession);

impl BookingClient<'_> {
    async_client_method!(get_conf, "GETCONF", request::booking::GetConfReq => response::booking::GetConfRes);
}
