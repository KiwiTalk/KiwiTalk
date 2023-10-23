// @generated automatically by Diesel CLI.

diesel::table! {
    channel_list (id) {
        id -> BigInt,
        #[sql_name = "type"]
        type_ -> Text,
        display_users -> Text,
        last_seen_log_id -> Nullable<BigInt>,
        last_update -> BigInt,
    }
}

diesel::table! {
    channel_meta (channel_id, type_) {
        channel_id -> BigInt,
        #[sql_name = "type"]
        type_ -> Integer,
        author_id -> BigInt,
        updated_at -> BigInt,
        revision -> BigInt,
        content -> Text,
    }
}

diesel::table! {
    chat (log_id) {
        log_id -> BigInt,
        channel_id -> BigInt,
        prev_log_id -> Nullable<BigInt>,
        #[sql_name = "type"]
        type_ -> Integer,
        message_id -> BigInt,
        send_at -> BigInt,
        author_id -> BigInt,
        message -> Nullable<Text>,
        attachment -> Nullable<Text>,
        supplement -> Nullable<Text>,
        referer -> Nullable<Integer>,
        deleted_time -> Nullable<BigInt>,
    }
}

diesel::table! {
    normal_channel (id) {
        id -> BigInt,
        joined_at_for_new_mem -> Nullable<BigInt>,
        inviter_user_id -> Nullable<BigInt>,
    }
}

diesel::table! {
    normal_channel_user (id, channel_id) {
        id -> BigInt,
        channel_id -> BigInt,
        country_iso -> Text,
        account_id -> BigInt,
        status_message -> Text,
        linked_services -> Text,
        suspended -> Bool,
    }
}

diesel::table! {
    user_profile (id, channel_id) {
        id -> BigInt,
        channel_id -> BigInt,
        nickname -> Text,
        profile_url -> Text,
        full_profile_url -> Text,
        original_profile_url -> Text,
        watermark -> Nullable<BigInt>,
    }
}

diesel::allow_tables_to_appear_in_same_query!(
    channel_list,
    channel_meta,
    chat,
    normal_channel,
    normal_channel_user,
    user_profile,
);
