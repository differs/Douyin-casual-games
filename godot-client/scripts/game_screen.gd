extends Node2D

signal game_over_requested(result: Dictionary)
signal revive_requested

var game_running: bool = false
var revive_used: int = 0
var last_progress: float = 0.0
@onready var score_label: Label = $"HudLayer/HudRoot/HudVBox/HudRow/ScoreLabel"
@onready var stage_label: Label = $"HudLayer/HudRoot/HudVBox/HudRow/StageLabel"
@onready var revive_label: Label = $"HudLayer/HudRoot/HudVBox/HudRow/ReviveLabel"
@onready var progress_bar: ProgressBar = $"HudLayer/HudRoot/HudVBox/ProgressBar"
@onready var world: Node2D = $World
@onready var player: Node2D = $World/Player
@onready var spawn_manager: Node = $SpawnManager
@onready var collision_manager: Node = $CollisionManager
@onready var progression_manager: Node = $ProgressionManager


func start_game() -> void:
    game_running = true
    visible = true
    revive_used = 0
    player.reset_state()
    spawn_manager.reset_world()
    _refresh_hud("鱼苗", 0.0)
    queue_redraw()


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

    if bool(collision_result.player_died):
        player.alive = false
        game_running = false
        game_over_requested.emit({
            "score": player.score,
            "stage": stage_label.text.replace("阶段: ", ""),
            "coin_reward": max(8, int(player.score / 10)),
        })

    queue_redraw()


func _unhandled_input(event: InputEvent) -> void:
    if not game_running:
        return
    if event is InputEventScreenTouch and event.pressed:
        player.set_target((event as InputEventScreenTouch).position)
    elif event is InputEventScreenDrag:
        player.set_target((event as InputEventScreenDrag).position)
    elif event is InputEventMouseButton and event.pressed:
        player.set_target((event as InputEventMouseButton).position)
    elif event is InputEventMouseMotion and Input.is_mouse_button_pressed(MOUSE_BUTTON_LEFT):
        player.set_target((event as InputEventMouseMotion).position)


func _draw() -> void:
    if not visible:
        return

    for food in spawn_manager.foods:
        draw_circle(food.position, food.radius, Color("d9ed92"))

    for fish in spawn_manager.fishes:
        draw_circle(fish.position, fish.radius, fish.color)


func _refresh_hud(stage_name: String, progress: float) -> void:
    score_label.text = "分数: %d" % player.score
    stage_label.text = "阶段: %s" % stage_name
    revive_label.text = "复活: %d/1" % revive_used
    progress_bar.value = progress * 100.0
    last_progress = progress
