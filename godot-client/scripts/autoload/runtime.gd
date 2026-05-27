extends Node

const STORAGE_AUDIO_ENABLED := "audio_enabled"
const STORAGE_TOKEN := "token"

var token: String = ""
var audio_enabled: bool = true
var best_score: int = 0
var coin: int = 0
var nickname: String = "玩家"


func load_local_settings() -> void:
    var settings := ConfigFile.new()
    var err := settings.load("user://local_settings.cfg")
    if err != OK:
        return
    token = str(settings.get_value("session", STORAGE_TOKEN, ""))
    audio_enabled = bool(settings.get_value("settings", STORAGE_AUDIO_ENABLED, true))


func save_local_settings() -> void:
    var settings := ConfigFile.new()
    settings.set_value("session", STORAGE_TOKEN, token)
    settings.set_value("settings", STORAGE_AUDIO_ENABLED, audio_enabled)
    settings.save("user://local_settings.cfg")


func clear_session() -> void:
    token = ""
    save_local_settings()


func profile_snapshot() -> Dictionary:
    return {
        "nickname": nickname,
        "best_score": best_score,
        "coin": coin,
        "audio_enabled": audio_enabled,
    }


func apply_result(score: int, coin_reward: int) -> Dictionary:
    best_score = max(best_score, score)
    coin += coin_reward
    save_local_settings()
    return {
        "best_score": best_score,
        "coin": coin,
        "coin_reward": coin_reward,
    }


func apply_double_reward(extra_coin: int) -> Dictionary:
    coin += extra_coin
    save_local_settings()
    return {
        "coin": coin,
    }
