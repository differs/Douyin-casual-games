extends Node

const STAGES := [
    {"level": 1, "label": "鱼苗", "radius": 14.0, "speed": 170.0, "exp_required": 0},
    {"level": 2, "label": "小丑鱼", "radius": 18.0, "speed": 182.0, "exp_required": 36},
    {"level": 3, "label": "河豚", "radius": 22.0, "speed": 190.0, "exp_required": 100},
    {"level": 4, "label": "海马", "radius": 26.0, "speed": 198.0, "exp_required": 210},
    {"level": 5, "label": "鲭鱼", "radius": 30.0, "speed": 206.0, "exp_required": 360},
    {"level": 6, "label": "鲨鱼幼体", "radius": 36.0, "speed": 212.0, "exp_required": 560},
    {"level": 7, "label": "鲨鱼", "radius": 44.0, "speed": 220.0, "exp_required": 850},
    {"level": 8, "label": "深海巨兽", "radius": 56.0, "speed": 228.0, "exp_required": 1200},
]


func apply_exp(player: Node2D, value: int) -> Dictionary:
    player.exp += value
    var upgraded := false

    while player.stage < STAGES.size():
        var next_stage: Dictionary = STAGES[player.stage]
        if player.exp < int(next_stage.exp_required):
            break
        player.stage = int(next_stage.level)
        player.radius = float(next_stage.radius)
        player.speed = float(next_stage.speed)
        upgraded = true

    var current: Dictionary = STAGES[player.stage - 1]
    var progress := 1.0
    if player.stage < STAGES.size():
        var next_cfg: Dictionary = STAGES[player.stage]
        progress = clampf(
            float(player.exp - int(current.exp_required)) / maxf(1.0, float(int(next_cfg.exp_required) - int(current.exp_required))),
            0.0,
            1.0,
        )

    return {
        "upgraded": upgraded,
        "stage_label": current.label,
        "progress": progress,
    }
