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

function addValueControlWidgetInternal(node, targetWidget, defaultValue = "randomize", values, widgetName, inputData) {
	let name = inputData[1]?.control_after_generate;
	if(typeof name !== "string") {
		name = widgetName;
	}
	const widgets = addValueControlWidgetsInternal(node, targetWidget, defaultValue, {
		addFilterList: false,
		controlAfterGenerateName: name
	}, inputData);
	return widgets[0];
}

function addValueControlWidgetsInternal(node, targetWidget, defaultValue = "randomize", options, addValueControlWidgetsInternal) {
	if (!defaultValue) defaultValue = "randomize";
	if (!options) options = {};

	const getName = (defaultName, optionName) => {
		let name = defaultName;
		if (options[optionName]) {
			name = options[optionName];
		} else if (typeof addValueControlWidgetsInternal?.[1]?.[defaultName] === "string") {
			name = addValueControlWidgetsInternal?.[1]?.[defaultName];
		} else if (addValueControlWidgetsInternal?.[1]?.control_prefix) {
			name = addValueControlWidgetsInternal?.[1]?.control_prefix + " " + name
		}
		return name;
	}

	const widgets = [];
	const valueControl = node.addWidget(
		"combo",
		getName("control_after_generate", "controlAfterGenerateName"),
		defaultValue,
		function () {},
		{
			values: ["fixed", "randomize"],
			serialize: false, // Don't include this in prompt.
		}
	);
	valueControl[IS_CONTROL_WIDGET] = true;
	updateControlWidgetLabel(valueControl);
	widgets.push(valueControl);

	const isCombo = targetWidget.type === "combo";
	let comboFilter;
	if (isCombo && options.addFilterList !== false) {
		comboFilter = node.addWidget(
			"string",
			getName("control_filter_list", "controlFilterListName"),
			"",
			function () {},
			{
				serialize: false, // Don't include this in prompt.
			}
		);
		updateControlWidgetLabel(comboFilter);

		widgets.push(comboFilter);
	}

	const applyWidgetControl = () => {
		var v = valueControl.value;

		if (isCombo && v !== "fixed") {
			let values = targetWidget.options.values;
			const filter = comboFilter?.value;
			if (filter) {
				let check;
				if (filter.startsWith("/") && filter.endsWith("/")) {
					try {
						const regex = new RegExp(filter.substring(1, filter.length - 1));
						check = (item) => regex.test(item);
					} catch (error) {
						console.error("Error constructing RegExp filter for node " + node.id, filter, error);
					}
				}
				if (!check) {
					const lower = filter.toLocaleLowerCase();
					check = (item) => item.toLocaleLowerCase().includes(lower);
				}
				values = values.filter(item => check(item));
				if (!values.length && targetWidget.options.values.length) {
					console.warn("Filter for node " + node.id + " has filtered out all items", filter);
				}
			}
			let current_index = values.indexOf(targetWidget.value);
			let current_length = values.length;

			switch (v) {
				case "randomize":
					current_index = Math.floor(Math.random() * current_length);
				default:
					break;
			}
			current_index = Math.max(0, current_index);
			current_index = Math.min(current_length - 1, current_index);
			if (current_index >= 0) {
				let value = values[current_index];
				targetWidget.value = value;
				targetWidget.callback(value);
			}
		} else {
			//number
			let min = targetWidget.options.min;
			let max = targetWidget.options.max;
			// limit to something that javascript can handle
			max = Math.min(1125899906842624, max);
			min = Math.max(-1125899906842624, min);
			let range = (max - min) / (targetWidget.options.step / 10);

			//adjust values based on valueControl Behaviour
			switch (v) {
				case "fixed":
					break;
				case "randomize":
					targetWidget.value = Math.floor(Math.random() * range) * (targetWidget.options.step / 10) + min;
				default:
					break;
			}
			/*check if values are over or under their respective
			 * ranges and set them to min or max.*/
			if (targetWidget.value < min) targetWidget.value = min;

			if (targetWidget.value > max)
				targetWidget.value = max;
			targetWidget.callback(targetWidget.value);
		}
	};

	valueControl.beforeQueued = () => {
		if (controlValueRunBefore) {
			// Don't run on first execution
			if (valueControl[HAS_EXECUTED]) {
				applyWidgetControl();
			}
		}
		valueControl[HAS_EXECUTED] = true;
	};

	valueControl.afterQueued = () => {
		if (!controlValueRunBefore) {
			applyWidgetControl();
		}
	};

	return widgets;
};
