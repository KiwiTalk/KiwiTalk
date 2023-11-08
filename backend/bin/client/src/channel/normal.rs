use anyhow::Context;
use kiwi_talk_result::TauriResult;

use crate::ClientState;

#[tauri::command(async)]
pub(crate) async fn normal_channel_read_chat(
    id: String,
    log_id: String,
    client: ClientState<'_>,
) -> TauriResult<()> {
    let talk = client.talk()?;

    talk.normal_channel(id.parse().context("invalid channel id")?)
        .read_chat(log_id.parse().context("invalid logId")?)
        .await
        .context("cannot read chat")?;

    Ok(())
}
