extends Control

signal restart_requested
signal double_reward_requested

var result_payload: Dictionary = {}


func open(payload: Dictionary) -> void:
    result_payload = payload
    visible = true


func close() -> void:
    visible = false
