use talk_loco_command::{request, response};

use crate::LocoRequestSession;

use super::async_client_method;

#[derive(Debug)]
pub struct CheckinClient<'a>(pub &'a LocoRequestSession);

impl CheckinClient<'_> {
    async_client_method!(checkin, "CHECKIN", request::checkin::CheckinReq => response::checkin::CheckinRes);

    async_client_method!(buy_cs, "BUYCS", request::checkin::BuyCSReq => response::checkin::BuyCSRes);
}
