extends Node2D

signal game_over_requested(result: Dictionary)
signal revive_requested

var game_running: bool = false


func start_game() -> void:
    game_running = true


func stop_game() -> void:
    game_running = false
