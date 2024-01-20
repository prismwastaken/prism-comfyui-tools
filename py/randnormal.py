import numpy
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
                "seed": ("INT", {"default": 0}),
                "last_value": ("FLOAT", {"default": 0})
            },
            "hidden": {
                "id": "UNIQUE_ID",
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
        round (float): Digits to round the output to
        seed (int): Seed value for the coloring transform
        last_value (float): The last value generated; changing it does nothing
    """
    
    def main(self, id:int, mean, sd, round_to, seed, last_value):
        # Since we HAVE to use control_after_generate to get many other good things involving execution
        # order and serialization, use the seed it gives us to turn this RNG into a coloring transformation.
        output = round(RandomNormal.transform(seed, mean, sd), round_to)
        # Hey, why not EVENTUALLY update the UI, also give the user a little feedback if their choices are sane.
        # This is also why last_value exists, so JS can have a field to write into
        PromptServer.instance.send_sync("Prism-RandomNormal", {"value":output, "id":id})
        return (output, int(output))
    
    def transform(seed:int, mean:float, sd:float):
        rng = numpy.random.default_rng(seed)
        return rng.normal(mean, sd)

    def IS_CHANGED(self, **kwargs):
        return float('nan')
    
NODE_CLASS_MAPPINGS = { "Prism-RandomNormal": RandomNormal }
NODE_DISPLAY_NAME_MAPPINGS = { "Prism-RandomNormal": "Random (Normal Distribution)" }