"""
@author: Prism
@title: Prism's Tools
"""

import secrets
import numpy
import sys

class RandomNormal:
    class Config:
        def __init__(self, **kwargs):
            self.__dict__.update(kwargs)
    config = Config(value=0)
    
    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "mean": ("FLOAT", {"default": 0, "min": sys.float_info.min, "max": sys.float_info.max}),
                "sd": ("FLOAT", {"default": 1, "min": 0, "max": sys.float_info.max}),
                "round_to": ("INT", {"default": 3, "min": 0, "max": 16}),
                "value_after_generate": (["randomize", "fixed"],)
            },
        }

    RETURN_TYPES = ("FLOAT", "INT",)
    RETURN_NAMES = ("Float", "Int",)
    #OUTPUT_NODE = True
    FUNCTION = "main"
    CATEGORY = "Prism's Tools"
    
    def main(self, mean, sd, round_to, value_after_generate):
        config = RandomNormal.config
        if(value_after_generate == "randomize"):
            rng = numpy.random.default_rng(secrets.randbits(128))
            config.value = round(rng.normal(mean, sd), round_to)
        print ("Value generated: " + str(config.value))
        return (config.value, int(config.value),)

    def IS_CHANGED(self, **kwargs):
        return float('nan')
    
NODE_CLASS_MAPPINGS = { "Random (Normal Distribution)": RandomNormal }
NODE_DISPLAY_NAME_MAPPINGS = { "RandomNormal": "Random (Normal Distribution)" }