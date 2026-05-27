extends Node2D

var stage: int = 1
var exp: int = 0
var radius: float = 14.0
var speed: float = 170.0
var target_position_world: Vector2 = Vector2.ZERO
var score: int = 0
var eat_food_count: int = 0
var eat_fish_count: int = 0
var alive: bool = true
var velocity: Vector2 = Vector2.ZERO


func reset_state() -> void:
    stage = 1
    exp = 0
    radius = 14.0
    speed = 170.0
    score = 0
    eat_food_count = 0
    eat_fish_count = 0
    alive = true
    velocity = Vector2.ZERO
    position = Vector2(360, 640)
    target_position_world = position


func set_target(world_position: Vector2) -> void:
    target_position_world = world_position


func step(delta: float) -> void:
    if not alive:
        return

    var to_target := target_position_world - position
    if to_target.length() < 2.0:
        velocity = velocity.lerp(Vector2.ZERO, min(1.0, delta * 8.0))
        return

    var desired_velocity := to_target.normalized() * speed
    velocity = velocity.lerp(desired_velocity, min(1.0, delta * 7.0))
    position += velocity * delta


func _draw() -> void:
    draw_circle(Vector2.ZERO, radius, Color("ffd166"))
    draw_circle(Vector2(radius * 0.35, -radius * 0.12), max(2.0, radius * 0.14), Color.WHITE)


func revive_at(world_position: Vector2) -> void:
    alive = true
    position = world_position
    target_position_world = world_position
    velocity = Vector2.ZERO
