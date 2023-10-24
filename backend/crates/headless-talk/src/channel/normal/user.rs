use crate::user::UserProfile;

#[derive(Debug, Clone)]
pub struct NormalChannelUser {
    pub profile: UserProfile,

    pub country_iso: String,
    pub suspended: bool,

    pub watermark: i64,
}
