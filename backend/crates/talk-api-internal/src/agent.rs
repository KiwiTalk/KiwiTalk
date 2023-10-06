#[derive(Debug, Clone, Copy)]
pub enum TalkApiAgent<'a> {
    /// Android agent with os version
    Android(&'a str),

    /// Win32 agent with os version
    Win32(&'a str),

    /// Custom agent
    Custom { agent: &'a str, user_agent: &'a str },
}

impl<'a> TalkApiAgent<'a> {
    pub fn agent(&self) -> &str {
        match self {
            TalkApiAgent::Android(_) => "android",
            TalkApiAgent::Win32(_) => "win32",
            TalkApiAgent::Custom {
                agent,
                user_agent: _,
            } => agent,
        }
    }

    pub fn get_user_agent(&self, version: &str, language: &str) -> String {
        match self {
            TalkApiAgent::Android(os_version) => {
                format!("KT/{} An/{} {}", version, os_version, language)
            }
            TalkApiAgent::Win32(os_version) => {
                format!("KT/{} Wd/{} {}", version, os_version, language)
            }
            TalkApiAgent::Custom {
                agent: _,
                user_agent,
            } => user_agent.to_string(),
        }
    }
}
