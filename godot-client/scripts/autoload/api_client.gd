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
