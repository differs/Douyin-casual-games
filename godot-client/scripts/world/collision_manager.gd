extends Node

func process_collisions(player: Node2D, foods: Array[Dictionary], fishes: Array[Dictionary]) -> Dictionary:
    var consumed_food_indices: Array[int] = []
    var consumed_fish_indices: Array[int] = []
    var exp_gain := 0
    var score_gain := 0
    var player_died := false

    for index in foods.size():
        var food := foods[index]
        if player.position.distance_to(food.position) <= player.radius + food.radius:
            consumed_food_indices.append(index)
            exp_gain += int(food.exp)
            score_gain += int(food.score)

    for index in fishes.size():
        var fish := fishes[index]
        if player.position.distance_to(fish.position) > player.radius + fish.radius:
            continue

        if fish.stage < player.stage or fish.radius + 3.0 < player.radius:
            consumed_fish_indices.append(index)
            exp_gain += 28 + int(fish.stage) * 10
            score_gain += int(fish.score)
            continue

        player_died = true
        break

    consumed_food_indices.sort()
    consumed_food_indices.reverse()
    for index in consumed_food_indices:
        foods.remove_at(index)

    consumed_fish_indices.sort()
    consumed_fish_indices.reverse()
    for index in consumed_fish_indices:
        fishes.remove_at(index)

    return {
        "exp_gain": exp_gain,
        "score_gain": score_gain,
        "food_eaten": consumed_food_indices.size(),
        "fish_eaten": consumed_fish_indices.size(),
        "player_died": player_died,
    }
