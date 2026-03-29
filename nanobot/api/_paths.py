"""nanobot.api._paths - Path utilities for PyInstaller compatibility.

This module provides utilities for resolving resource paths both in
development mode and when running as a PyInstaller frozen executable.

When nanobot is packaged with PyInstaller, resources (templates, skills, etc.)
are extracted to a temporary directory accessible via `sys._MEIPASS`. This
module provides a consistent interface for accessing these resources.

Usage:
    from nanobot.api._paths import get_resource_path

    template_path = get_resource_path("templates/AGENTS.md")
"""

import sys
from pathlib import Path


def get_resource_path(relative_path: str) -> Path:
    """获取资源文件的绝对路径，兼容 PyInstaller 打包环境。

    Args:
        relative_path: 相对于 nanobot 包根目录的资源路径。

    Returns:
        资源文件的绝对路径。

    在开发环境中，返回相对于包根目录的路径。
    在 PyInstaller 打包环境中，返回 `sys._MEIPASS` 下的路径。
    """
    if hasattr(sys, "_MEIPASS"):
        # PyInstaller 打包后的环境
        # _MEIPASS 是 PyInstaller 解压资源到临时目录的路径
        base_path = Path(sys._MEIPASS)  # type: ignore[attr-defined]
    else:
        # 开发环境
        # 从当前文件位置向上查找到 nanobot 包根目录
        base_path = Path(__file__).parent.parent

    return base_path / relative_path


def get_templates_path() -> Path:
    """获取模板目录的路径。

    Returns:
        模板目录的绝对路径。
    """
    return get_resource_path("templates")


def get_skills_path() -> Path:
    """获取技能目录的路径。

    Returns:
        技能目录的绝对路径。
    """
    return get_resource_path("skills")


def is_frozen() -> bool:
    """检查是否运行在 PyInstaller 打包环境中。

    Returns:
        如果是打包后的环境返回 True，否则返回 False。
    """
    return hasattr(sys, "_MEIPASS")


def get_executable_dir() -> Path:
    """获取可执行文件所在的目录。

    Returns:
        打包环境返回 exe 所在目录，开发环境返回包根目录。
    """
    if is_frozen():
        return Path(sys.executable).parent
    return Path(__file__).parent.parent


__all__ = [
    "get_resource_path",
    "get_templates_path",
    "get_skills_path",
    "is_frozen",
    "get_executable_dir",
]
