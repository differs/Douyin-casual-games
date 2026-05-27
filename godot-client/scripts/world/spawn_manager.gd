extends Node

const WORLD_SIZE := Vector2(1080, 1920)
const FOOD_COUNT := 36
const FISH_COUNT := 10
const DANGER_COUNT := 4

var foods: Array[Dictionary] = []
var fishes: Array[Dictionary] = []


func reset_world() -> void:
    foods.clear()
    fishes.clear()

    for i in range(FOOD_COUNT):
        foods.append(_make_food())

    for i in range(FISH_COUNT):
        fishes.append(_make_fish(false))

    for i in range(DANGER_COUNT):
        fishes.append(_make_fish(true))


func step(delta: float, player_stage: int) -> void:
    for fish in fishes:
        fish.position += fish.velocity * delta
        if fish.position.x < 20.0 or fish.position.x > WORLD_SIZE.x - 20.0:
            fish.velocity.x *= -1.0
        if fish.position.y < 140.0 or fish.position.y > WORLD_SIZE.y - 20.0:
            fish.velocity.y *= -1.0

        if fish.is_danger and fish.stage >= player_stage + 1:
            fish.velocity *= 1.0008

    while foods.size() < FOOD_COUNT:
        foods.append(_make_food())

    while fishes.size() < FISH_COUNT + DANGER_COUNT:
        fishes.append(_make_fish(fishes.size() >= FISH_COUNT))


func _make_food() -> Dictionary:
    return {
        "position": Vector2(randf_range(30.0, WORLD_SIZE.x - 30.0), randf_range(180.0, WORLD_SIZE.y - 40.0)),
        "radius": randf_range(5.0, 9.0),
        "exp": randi_range(8, 14),
        "score": randi_range(5, 9),
    }


func _make_fish(dangerous: bool) -> Dictionary:
    var base_stage := randi_range(1, 4)
    if dangerous:
        base_stage = randi_range(4, 7)

    var radius := 10.0 + float(base_stage) * 5.0
    return {
        "position": Vector2(randf_range(40.0, WORLD_SIZE.x - 40.0), randf_range(180.0, WORLD_SIZE.y - 40.0)),
        "velocity": Vector2(randf_range(-80.0, 80.0), randf_range(-60.0, 60.0)),
        "radius": radius if dangerous else radius - 4.0,
        "stage": min(base_stage + (1 if dangerous else 0), 8),
        "is_danger": dangerous,
        "score": 18 + base_stage * 7,
        "color": Color("16324f") if dangerous else Color.from_string(_stage_color(base_stage), Color("43aa8b")),
    }


func _stage_color(stage: int) -> String:
    var palette := {
        1: "ffd166",
        2: "ffb703",
        3: "fb8500",
        4: "90be6d",
        5: "43aa8b",
        6: "4d908e",
        7: "577590",
        8: "277da1",
    }
    return palette.get(stage, "43aa8b")
