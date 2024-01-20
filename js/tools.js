import { app } from "../../../scripts/app.js";
import { api } from "../../../scripts/api.js";
import { addValueControlWidget } from "../../../scripts/widgets.js";

/*
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
*/

app.registerExtension({
	name: "Prism-RandomNormal",
	async nodeCreated(node) {
		if (node.comfyClass == "Prism-RandomNormal") {
        	const randomNormalWidgetIndex = node.widgets?.findIndex((w) => w.name === 'value'); 
        	if (randomNormalWidgetIndex > -1) {
            	const randomNormalWidget = node.widgets[randomNormalWidgetIndex];
            	const randomNormalValueControl = addValueControlWidget(node, randomNormalWidget, "randomize", "", "", "");
            	node.widgets.splice(randomNormalWidgetIndex+1,0,node.widgets.pop());
        }}
    }
});
