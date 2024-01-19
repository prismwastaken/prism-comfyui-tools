import { app } from "../../../scripts/app.js";
import { api } from "../../../scripts/api.js";
import { addValueControlWidget } from "../../../scripts/widgets.js";

async function randNormalHandler(event) {

	let nodes = app.graph._nodes_by_id;
	let node = nodes[event.detail.id];
    const value = event.detail.value;

	if(node) {
        var widget = node.widgets?.find((widget) => widget.name === 'value')
	    if (widget) {
		    widget.value = value;
		    this.onResize?.(this.size);
	    }   
	}
}

api.addEventListener("prism-randnormal", randNormalHandler);

app.registerExtension({
	name: "RandomNormal",
	async nodeCreated(node) { 
        const variationSeedWidgetIndex = node.widgets?.findIndex((w) => w.name === 'variation_seed'); 
        if (variationSeedWidgetIndex > -1) {
            const variationSeedWidget = node.widgets[variationSeedWidgetIndex];
            const variationSeedValueControl = addValueControlWidget(node, variationSeedWidget, "fixed");
            node.widgets.splice(variationSeedWidgetIndex+1,0,node.widgets.pop());
        }
    }
});
