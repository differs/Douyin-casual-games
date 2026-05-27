extends Node2D

signal game_over_requested(result: Dictionary)
signal revive_requested

var game_running: bool = false
var revive_used: int = 0
var last_progress: float = 0.0
var last_result: Dictionary = {}
@onready var score_label: Label = $"HudLayer/HudRoot/HudVBox/HudRow/ScoreLabel"
@onready var stage_label: Label = $"HudLayer/HudRoot/HudVBox/HudRow/StageLabel"
@onready var revive_label: Label = $"HudLayer/HudRoot/HudVBox/HudRow/ReviveLabel"
@onready var progress_bar: ProgressBar = $"HudLayer/HudRoot/HudVBox/ProgressBar"
@onready var world: Node2D = $World
@onready var player: Node2D = $World/Player
@onready var foods_layer: Node2D = $World/FoodsLayer
@onready var fishes_layer: Node2D = $World/FishesLayer
@onready var camera: Camera2D = $World/Camera2D
@onready var spawn_manager: Node = $SpawnManager
@onready var collision_manager: Node = $CollisionManager
@onready var progression_manager: Node = $ProgressionManager


func start_game() -> void:
    game_running = true
    visible = true
    revive_used = 0
    last_result = {}
    player.reset_state()
    spawn_manager.reset_world()
    _refresh_hud("鱼苗", 0.0)
    _refresh_world_layers()
    camera.position = player.position


func stop_game() -> void:
    game_running = false
    visible = false


func _ready() -> void:
    set_process(true)
    set_process_unhandled_input(true)


func _process(delta: float) -> void:
    if not game_running:
        return

    player.step(delta)
    spawn_manager.step(delta, player.stage)
    var collision_result: Dictionary = collision_manager.process_collisions(player, spawn_manager.foods, spawn_manager.fishes)
    if int(collision_result.exp_gain) > 0:
        var progression_result := progression_manager.apply_exp(player, int(collision_result.exp_gain))
        player.score += int(collision_result.score_gain)
        player.eat_food_count += int(collision_result.food_eaten)
        player.eat_fish_count += int(collision_result.fish_eaten)
        _refresh_hud(String(progression_result.stage_label), float(progression_result.progress))
        player.queue_redraw()

    if bool(collision_result.player_died):
        player.alive = false
        game_running = false
        last_result = {
            "score": player.score,
            "stage": stage_label.text.replace("阶段: ", ""),
            "coin_reward": max(8, int(player.score / 10)),
        }
        game_over_requested.emit(last_result)
        return

    _refresh_world_layers()
    camera.position = camera.position.lerp(player.position, min(1.0, delta * 4.0))


func _unhandled_input(event: InputEvent) -> void:
    if not game_running:
        return
    if event is InputEventScreenTouch and event.pressed:
        player.set_target(_screen_to_world((event as InputEventScreenTouch).position))
    elif event is InputEventScreenDrag:
        player.set_target(_screen_to_world((event as InputEventScreenDrag).position))
    elif event is InputEventMouseButton and event.pressed:
        player.set_target(_screen_to_world((event as InputEventMouseButton).position))
    elif event is InputEventMouseMotion and Input.is_mouse_button_pressed(MOUSE_BUTTON_LEFT):
        player.set_target(_screen_to_world((event as InputEventMouseMotion).position))


func _refresh_hud(stage_name: String, progress: float) -> void:
    score_label.text = "分数: %d" % player.score
    stage_label.text = "阶段: %s" % stage_name
    revive_label.text = "复活: %d/1" % revive_used
    progress_bar.value = progress * 100.0
    last_progress = progress


func revive_game() -> void:
    revive_used += 1
    player.revive_at(player.position + Vector2(0, -40))
    game_running = true
    revive_label.text = "复活: %d/1" % revive_used


func current_result() -> Dictionary:
    if last_result.is_empty():
        return {
            "score": player.score,
            "stage": stage_label.text.replace("阶段: ", ""),
            "coin_reward": max(8, int(player.score / 10)),
        }
    return last_result


func _refresh_world_layers() -> void:
    foods_layer.update_foods(spawn_manager.foods)
    fishes_layer.update_fishes(spawn_manager.fishes)


func _screen_to_world(screen_position: Vector2) -> Vector2:
    var viewport_size := get_viewport_rect().size
    return camera.position + (screen_position - viewport_size * 0.5)
