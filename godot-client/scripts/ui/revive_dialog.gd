extends Control

signal revive_confirmed
signal revive_skipped
@onready var revive_button: Button = $"Panel/VBox/ReviveButton"
@onready var skip_button: Button = $"Panel/VBox/SkipButton"


func open() -> void:
    visible = true


func close() -> void:
    visible = false


func _ready() -> void:
    revive_button.pressed.connect(_on_revive_pressed)
    skip_button.pressed.connect(_on_skip_pressed)


func _on_revive_pressed() -> void:
    revive_confirmed.emit()


func _on_skip_pressed() -> void:
    revive_skipped.emit()
