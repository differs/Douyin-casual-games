extends Control

signal start_pressed
signal audio_toggled(enabled: bool)

var best_score: int = 0
var coin: int = 0


func refresh(profile_best_score: int, profile_coin: int, audio_enabled: bool) -> void:
    best_score = profile_best_score
    coin = profile_coin
    emit_signal("audio_toggled", audio_enabled)
