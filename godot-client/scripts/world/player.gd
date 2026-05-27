extends Node2D

var stage: int = 1
var exp: int = 0
var radius: float = 14.0
var speed: float = 170.0
var target_position_world: Vector2 = Vector2.ZERO


func reset_state() -> void:
    stage = 1
    exp = 0
    radius = 14.0
    speed = 170.0
