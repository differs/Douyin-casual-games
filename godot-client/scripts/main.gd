extends Node

var play_state := "boot"
var revive_offered: bool = false
var pending_result: Dictionary = {}
@onready var home_screen: Control = $HomeScreen
@onready var game_screen: Node2D = $GameScreen
@onready var revive_dialog: Control = $ReviveDialog
@onready var result_dialog: Control = $ResultDialog


func _ready() -> void:
    Runtime.load_local_settings()
    ApiClient.set_runtime(Runtime)
    _wire_signals()
    _refresh_home()
    _show_home()


func _wire_signals() -> void:
    home_screen.start_pressed.connect(_on_start_pressed)
    home_screen.audio_toggled.connect(_on_audio_toggled)
    game_screen.game_over_requested.connect(_on_game_over_requested)
    revive_dialog.revive_confirmed.connect(_on_revive_confirmed)
    revive_dialog.revive_skipped.connect(_on_revive_skipped)
    result_dialog.restart_requested.connect(_on_restart_requested)
    result_dialog.double_reward_requested.connect(_on_double_reward_requested)


func _refresh_home() -> void:
    var profile := ApiClient.load_home_profile()
    home_screen.refresh(int(profile.get("best_score", 0)), int(profile.get("coin", 0)), bool(profile.get("audio_enabled", true)))


func _show_home() -> void:
    play_state = "home"
    home_screen.visible = true
    game_screen.visible = false
    revive_dialog.visible = false
    result_dialog.visible = false


func _show_game() -> void:
    play_state = "playing"
    pending_result = {}
    home_screen.visible = false
    game_screen.visible = true
    revive_dialog.visible = false
    result_dialog.visible = false


func _on_start_pressed() -> void:
    revive_offered = false
    _show_game()
    game_screen.start_game()


func _on_audio_toggled(enabled: bool) -> void:
    Runtime.audio_enabled = enabled
    Runtime.save_local_settings()


func _on_game_over_requested(result: Dictionary) -> void:
    game_screen.stop_game()
    if not revive_offered:
        revive_offered = true
        pending_result = result
        play_state = "revive"
        revive_dialog.open()
        return

    play_state = "gameover"
    var submit_result := ApiClient.submit_result(result)
    Runtime.best_score = int(submit_result.get("best_score", Runtime.best_score))
    Runtime.coin = int(submit_result.get("coin", Runtime.coin))
    _refresh_home()
    result_dialog.open({
        "score": result.get("score", 0),
        "stage": result.get("stage", "鱼苗"),
        "coin_reward": int(submit_result.get("coin_reward", result.get("coin_reward", 0))),
    })


func _on_revive_confirmed() -> void:
    play_state = "playing"
    revive_dialog.close()
    game_screen.revive_game()


func _on_revive_skipped() -> void:
    revive_dialog.close()
    _on_game_over_requested(pending_result if not pending_result.is_empty() else game_screen.current_result())


func _on_restart_requested() -> void:
    result_dialog.close()
    _show_home()


func _on_double_reward_requested() -> void:
    if result_dialog.result_payload.is_empty():
        return
    var reward_result := ApiClient.claim_double_reward(result_dialog.result_payload)
    Runtime.coin = int(reward_result.get("coin", Runtime.coin))
    _refresh_home()
    result_dialog.open({
        "score": result_dialog.result_payload.get("score", 0),
        "stage": result_dialog.result_payload.get("stage", "鱼苗"),
        "coin_reward": int(result_dialog.result_payload.get("coin_reward", 0)) * 2,
    })
