extends Node2D

signal game_over_requested(result: Dictionary)
signal revive_requested

var game_running: bool = false
var fake_score: int = 0
var fake_stage: String = "鱼苗"
@onready var score_label: Label = $"HudLayer/HudRoot/HudVBox/HudRow/ScoreLabel"
@onready var stage_label: Label = $"HudLayer/HudRoot/HudVBox/HudRow/StageLabel"
@onready var revive_label: Label = $"HudLayer/HudRoot/HudVBox/HudRow/ReviveLabel"
@onready var progress_bar: ProgressBar = $"HudLayer/HudRoot/HudVBox/ProgressBar"
@onready var fake_timer: Timer = $FakeGameTimer


func start_game() -> void:
    game_running = true
    visible = true
    fake_score = 128
    fake_stage = "河豚"
    score_label.text = "分数: %d" % fake_score
    stage_label.text = "阶段: %s" % fake_stage
    revive_label.text = "复活: 0/1"
    progress_bar.value = 62.0
    fake_timer.start()


func stop_game() -> void:
    game_running = false
    visible = false
    fake_timer.stop()


func _ready() -> void:
    fake_timer.timeout.connect(_on_fake_game_timeout)


func _on_fake_game_timeout() -> void:
    if not game_running:
        return
    game_running = false
    game_over_requested.emit({
        "score": fake_score,
        "stage": fake_stage,
        "coin_reward": 12,
    })
