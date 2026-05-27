extends Node2D

var foods: Array[Dictionary] = []


func update_foods(next_foods: Array[Dictionary]) -> void:
    foods = next_foods
    queue_redraw()


func _draw() -> void:
    for food in foods:
        draw_circle(food.position, food.radius, Color("d9ed92"))
