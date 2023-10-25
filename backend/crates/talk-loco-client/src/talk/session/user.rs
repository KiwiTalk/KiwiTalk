#[derive(Debug, Clone, Copy, PartialEq, Eq)]
#[repr(i32)]
pub enum UserType {
    Unknown = -999999,
    NotFriend = -100,
    Deactivated = 9,
    Friend = 100,
    Openchat = 1000,
}
