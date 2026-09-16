from fastapi import APIRouter

from app.tools.registry import public_tools


router = APIRouter()


@router.get("/tools")
def list_tools() -> list[dict[str, object]]:
    return public_tools()
