import os
import json
import shutil
import inspect
from server import PromptServer

config = None

def init():
    install_js()
    log("JavaScript Initialized")
    return True

def log(message):
    config = get_extension_config()
    if "logging" not in config:
        return
    if not config["logging"]:
        return
    name = get_extension_config()["name"]
    print(f"{name}: {message}")

def get_ext_dir(subpath=None, mkdir=False):
    dir = os.path.dirname(__file__)
    if subpath is not None:
        dir = os.path.join(dir, subpath)
    dir = os.path.abspath(dir)
    if mkdir and not os.path.exists(dir):
        os.makedirs(dir)
    return dir

def get_comfy_dir(subpath=None, mkdir=False):
    dir = os.path.dirname(inspect.getfile(PromptServer))
    if subpath is not None:
        dir = os.path.join(dir, subpath)
    dir = os.path.abspath(dir)
    if mkdir and not os.path.exists(dir):
        os.makedirs(dir)
    return dir

def get_web_ext_dir():
    dir = get_comfy_dir("web/extensions/prism")
    if not os.path.exists(dir):
        os.makedirs(dir)
    dir = os.path.join(dir, "js")
    return dir

def get_extension_config(reload=False):
    global config
    if reload == False and config is not None:
        return config
    config_path = get_ext_dir("tools.json")
    if not os.path.exists(config_path):
        log("Missing tools.json - this extension may not work properly")
        print(f"Extension path: {get_ext_dir()}")
        return {"name": "Unknown", "version": -1}
    with open(config_path, "r") as f:
        config = json.loads(f.read())
    return config

def link_js(src, dst):
    src = os.path.abspath(src)
    dst = os.path.abspath(dst)
    if os.name == "nt":
        try:
            import _winapi
            _winapi.CreateJunction(src, dst)
            return True
        except:
            pass
    try:
        os.symlink(src, dst)
        return True
    except:
        import logging
        logging.exception('')
        return False

def is_junction(path):
    if os.name != "nt":
        return False
    try:
        return bool(os.readlink(path))
    except OSError:
        return False

def install_js():
    src_dir = get_ext_dir("js")
    if not os.path.exists(src_dir):
        log("No JavaScript")
        return
    dst_dir = get_web_ext_dir()
    if os.path.exists(dst_dir):
        if os.path.islink(dst_dir) or is_junction(dst_dir):
            log("JavaScript linked already")
            return
    elif link_js(src_dir, dst_dir):
        log("JavaScript linked")
        return
    shutil.copytree(src_dir, dst_dir, dirs_exist_ok=True)
    log("JavaScript copied")