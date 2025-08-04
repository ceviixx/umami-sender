from sqlalchemy.orm import Session
from app.models.value_mappings import ValueMappings
from typing import Any

def get_replace_map(db: Session) -> dict[str, str]:
    mappings = db.query(ValueMappings).all()
    return {entry.key: entry.value for entry in mappings}

def clean_value(value: Any, replace_map: dict[str, str]) -> Any:
    if isinstance(value, str) and value in replace_map:
        return replace_map[value]
    return value

def recursive_cleanup(obj: Any, replace_map: dict[str, str]) -> Any:
    if isinstance(obj, dict):
        return {k: recursive_cleanup(clean_value(v, replace_map), replace_map) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [recursive_cleanup(item, replace_map) for item in obj]
    else:
        return clean_value(obj, replace_map)

def process_api_response(response: Any, db: Session):
    replace_map = get_replace_map(db)
    cleaned = recursive_cleanup(response, replace_map)
    return cleaned