extends Control

signal start_pressed
signal audio_toggled(enabled: bool)

var best_score: int = 0
var coin: int = 0
@onready var best_score_label: Label = $"SafeArea/Panel/VBox/StatsRow/BestScoreLabel"
@onready var coin_label: Label = $"SafeArea/Panel/VBox/StatsRow/CoinLabel"
@onready var audio_toggle: CheckButton = $"SafeArea/Panel/VBox/AudioToggle"
@onready var runtime_label: Label = $"SafeArea/Panel/VBox/RuntimeLabel"
@onready var start_button: Button = $"SafeArea/Panel/VBox/StartButton"


func refresh(profile_best_score: int, profile_coin: int, audio_enabled: bool) -> void:
    best_score = profile_best_score
    coin = profile_coin
    best_score_label.text = "最高分: %d" % best_score
    coin_label.text = "金币: %d" % coin
    audio_toggle.button_pressed = audio_enabled
    runtime_label.text = "Godot 迁移模式"


func _ready() -> void:
    start_button.pressed.connect(_on_start_pressed)
    audio_toggle.toggled.connect(_on_audio_toggled)


func _on_start_pressed() -> void:
    start_pressed.emit()


func _on_audio_toggled(enabled: bool) -> void:
    audio_toggled.emit(enabled)
