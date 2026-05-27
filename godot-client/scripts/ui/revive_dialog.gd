extends Control

signal revive_confirmed
signal revive_skipped


func open() -> void:
    visible = true


func close() -> void:
    visible = false
