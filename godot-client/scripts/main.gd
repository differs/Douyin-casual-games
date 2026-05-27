extends Node2D

const STAGE_NAMES := [
    "鱼苗",
    "小丑鱼",
    "河豚",
    "海马",
    "鲭鱼",
    "鲨鱼幼体",
    "鲨鱼",
    "深海巨兽",
]

var play_state := "boot"
var hint_text := "Godot 客户端骨架已创建，等待在编辑器内重建玩法。"


func _ready() -> void:
    Runtime.load_local_settings()
    ApiClient.set_runtime(Runtime)
    play_state = "home"
    queue_redraw()


func _draw() -> void:
    draw_rect(Rect2(Vector2.ZERO, get_viewport_rect().size), Color("001d3d"))
    draw_string(
        ThemeDB.fallback_font,
        Vector2(36, 72),
        "深海吞噬进化",
        HORIZONTAL_ALIGNMENT_LEFT,
        -1,
        42,
        Color("f6fbff")
    )
    draw_string(
        ThemeDB.fallback_font,
        Vector2(36, 112),
        "Godot 迁移中：后续在这里重建首页、HUD、对局与结算。",
        HORIZONTAL_ALIGNMENT_LEFT,
        -1,
        20,
        Color("8ecae6")
    )
    draw_string(
        ThemeDB.fallback_font,
        Vector2(36, 160),
        "当前状态: %s" % play_state,
        HORIZONTAL_ALIGNMENT_LEFT,
        -1,
        18,
        Color("ffd166")
    )
    draw_string(
        ThemeDB.fallback_font,
        Vector2(36, 210),
        hint_text,
        HORIZONTAL_ALIGNMENT_LEFT,
        620,
        18,
        Color("d8effa")
    )
    draw_string(
        ThemeDB.fallback_font,
        Vector2(36, 280),
        "音效: %s" % ("开" if Runtime.audio_enabled else "关"),
        HORIZONTAL_ALIGNMENT_LEFT,
        -1,
        18,
        Color("d8effa")
    )
