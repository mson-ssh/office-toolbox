import asyncio
import os
import signal

from app.adapters.pymupdf.client import ProcessingError


async def run_process(arguments: list[str], timeout_seconds: int, environment: dict[str, str] | None = None) -> tuple[int, bytes, bytes]:
    process = await asyncio.create_subprocess_exec(
        *arguments,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
        start_new_session=True,
        env=environment,
    )
    try:
        stdout, stderr = await asyncio.wait_for(process.communicate(), timeout=timeout_seconds)
    except (TimeoutError, asyncio.CancelledError):
        if process.returncode is None:
            try:
                os.killpg(process.pid, signal.SIGKILL)
            except ProcessLookupError:
                pass
            await process.wait()
        if asyncio.current_task() and asyncio.current_task().cancelling():
            raise
        raise ProcessingError("PROCESSING_TIMEOUT", "Quá thời gian xử lý cho phép.") from None
    return process.returncode or 0, stdout, stderr
