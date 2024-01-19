import numpy
import secrets
import sys
from server import PromptServer

class RandomNormal:
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "mean": ("FLOAT", {"default": 0, "min": sys.float_info.min, "max": sys.float_info.max}),
                "sd": ("FLOAT", {"default": 1, "min": 0, "max": sys.float_info.max}),
                "round_to": ("INT", {"default": 3, "min": 0, "max": 16}),
                "control_after_generate": (["randomize", "fixed"],),
                "value": ("FLOAT", {"default": 0})
            },
            "hidden": {
                "id": "UNIQUE_ID"
            }
        }

    RETURN_TYPES = ("FLOAT", "INT",)
    RETURN_NAMES = ("Float", "Int",)
    OUTPUT_NODE = True
    FUNCTION = "main"
    CATEGORY = "Prism's Tools"

    """
    Generates a random number with normal distribution

    Arguments:
        mean (float): The mean value of the set
        sd (float): Standard deviation (\u03c3) of the sample
        round (float): Digits to round to
    """
    
    def main(self, id:int, mean, sd, round_to, control_after_generate, value):
        if(control_after_generate == "randomize"): 
            rng = numpy.random.default_rng(secrets.randbits(128))
            output = round(rng.normal(mean, sd), round_to)
            PromptServer.instance.send_sync("prism-randnormal", {"value":output, "id":id})
        else:
            output=value


        print ("DEBUG - Value generated: " + str(output))


        return (output, int(output))
    
    def IS_CHANGED(self, **kwargs):
        return float('nan')
    
NODE_CLASS_MAPPINGS = { "Random (Normal Distribution)": RandomNormal }
NODE_DISPLAY_NAME_MAPPINGS = { "RandomNormal": "Random (Normal Distribution)" }
