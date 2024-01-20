import { app } from "../../../scripts/app.js";
import { api } from "../../../scripts/api.js";

function randomNormalHandler(event) {
	let nodes = app.graph._nodes_by_id;
	let node = nodes[event.detail.id];
    const value = event.detail.value;

	if(node) {
        var widget = node.widgets?.find((widget) => widget.name === 'last_value')
	    if (widget) {
		    widget.value = value;
		    this.onResize?.(this.size);
	    }   
	}
	return true;
}

api.addEventListener("Prism-RandomNormal", randomNormalHandler);