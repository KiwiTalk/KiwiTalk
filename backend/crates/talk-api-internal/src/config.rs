use crate::agent::TalkApiAgent;

#[derive(Debug, Clone, Copy)]
pub struct Config<'a> {
    pub language: &'a str,
    pub version: &'a str,

    pub agent: TalkApiAgent<'a>,
}

impl Config<'_> {
    pub fn get_user_agent(self) -> String {
        self.agent.get_user_agent(self.version, self.language)
    }
}
