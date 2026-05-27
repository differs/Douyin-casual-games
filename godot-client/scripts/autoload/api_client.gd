extends Node

var runtime: Node = null
var api_base := "http://127.0.0.1:8080/api"


func set_runtime(node: Node) -> void:
    runtime = node


func configure(base_url: String) -> void:
    api_base = base_url.rstrip("/")


func login_placeholder(code: String, anonymous_id: String) -> Dictionary:
    return {
        "code": code,
        "anonymous_id": anonymous_id,
    }


func endpoint(path: String) -> String:
    return "%s%s" % [api_base, path]


func load_home_profile() -> Dictionary:
    if runtime == null:
        return {
            "nickname": "玩家",
            "best_score": 0,
            "coin": 0,
            "audio_enabled": true,
        }
    return runtime.profile_snapshot()


func submit_result(result: Dictionary) -> Dictionary:
    if runtime == null:
        return {
            "best_score": int(result.get("score", 0)),
            "coin": int(result.get("coin_reward", 0)),
            "coin_reward": int(result.get("coin_reward", 0)),
        }
    return runtime.apply_result(int(result.get("score", 0)), int(result.get("coin_reward", 0)))


func claim_double_reward(result: Dictionary) -> Dictionary:
    if runtime == null:
        return {"coin": int(result.get("coin_reward", 0))}
    return runtime.apply_double_reward(int(result.get("coin_reward", 0)))
