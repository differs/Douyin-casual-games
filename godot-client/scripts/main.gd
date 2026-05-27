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
    home_screen.refresh(Runtime.best_score, Runtime.coin, Runtime.audio_enabled)


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
    Runtime.best_score = max(Runtime.best_score, int(result.get("score", 0)))
    Runtime.coin += int(result.get("coin_reward", 0))
    Runtime.save_local_settings()
    _refresh_home()
    result_dialog.open(result)


func _on_revive_confirmed() -> void:
    play_state = "playing"
    revive_dialog.close()
    game_screen.start_game()


func _on_revive_skipped() -> void:
    revive_dialog.close()
    _on_game_over_requested(
        pending_result if not pending_result.is_empty() else {
            "score": 88,
            "stage": "河豚",
            "coin_reward": 8,
        }
    )


func _on_restart_requested() -> void:
    result_dialog.close()
    _show_home()


func _on_double_reward_requested() -> void:
    if result_dialog.result_payload.is_empty():
        return
    Runtime.coin += int(result_dialog.result_payload.get("coin_reward", 0))
    Runtime.save_local_settings()
    _refresh_home()
    result_dialog.open({
        "score": result_dialog.result_payload.get("score", 0),
        "stage": result_dialog.result_payload.get("stage", "鱼苗"),
        "coin_reward": int(result_dialog.result_payload.get("coin_reward", 0)) * 2,
    })
