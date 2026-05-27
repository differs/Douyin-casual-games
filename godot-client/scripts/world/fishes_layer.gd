extends Node2D

var fishes: Array[Dictionary] = []


func update_fishes(next_fishes: Array[Dictionary]) -> void:
    fishes = next_fishes
    queue_redraw()


func _draw() -> void:
    for fish in fishes:
        draw_circle(fish.position, fish.radius, fish.color)
