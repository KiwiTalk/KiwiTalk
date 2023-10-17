#[derive(Debug, Clone, Copy)]
pub struct ClientEnv<'a> {
    pub os: &'a str,
    pub net_type: NetworkType,
    pub mccmnc: &'a str,
    pub language: &'a str,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
#[repr(i16)]
pub enum NetworkType {
    Wired = 0,
}
