extends Control

signal restart_requested
signal double_reward_requested

var result_payload: Dictionary = {}
@onready var score_label: Label = $"Panel/VBox/ScoreLabel"
@onready var stage_label: Label = $"Panel/VBox/StageLabel"
@onready var reward_label: Label = $"Panel/VBox/RewardLabel"
@onready var restart_button: Button = $"Panel/VBox/RestartButton"
@onready var double_reward_button: Button = $"Panel/VBox/DoubleRewardButton"


func open(payload: Dictionary) -> void:
    result_payload = payload
    score_label.text = "本局分数: %s" % payload.get("score", 0)
    stage_label.text = "最高阶段: %s" % payload.get("stage", "鱼苗")
    reward_label.text = "金币奖励: %s" % payload.get("coin_reward", 0)
    visible = true


func close() -> void:
    visible = false


func _ready() -> void:
    restart_button.pressed.connect(_on_restart_pressed)
    double_reward_button.pressed.connect(_on_double_reward_pressed)


func _on_restart_pressed() -> void:
    restart_requested.emit()


func _on_double_reward_pressed() -> void:
    double_reward_requested.emit()
