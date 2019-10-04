
const invariant = require('invariant');
const React = require('react');

const emptyObject = Object.create(null);
const Context = React.createContext();

const resolveMapPropsToInjectables = (mapPropsToInjectables, props) => {
	if (typeof mapPropsToInjectables === 'object') {
		return mapPropsToInjectables;
	}

	if (typeof mapPropsToInjectables === 'function') {
		return mapPropsToInjectables(props);
	}

	invariant(false, 'Expected `mapPropsToInjectables` to be an object or a function from props to an object. Instead got `%s`', typeof mapPropsToInjectables);
};

const resolveMapRegistryToProps = (mapRegistryToProps, registry, props) => {
	if (Array.isArray(mapRegistryToProps)) {
		const props = {};

		for (const name of mapRegistryToProps) {
			const Component = registry[name];

			invariant(Component, 'Could not find a component by name `%s`. Make sure you supplied it via `wintInjectables`.', name);

			props[name] = Component;
		}

		return props;
	}

	if (typeof mapRegistryToProps === 'function') {
		return mapRegistryToProps(registry, props);
	}

	invariant(false, 'Expected `mapRegistryToProps` to be an object or a function from registry to props. Instead got `%s`', typeof mapRegistryToProps);
};

const Injectables = ({ children, injectables }) => React.createElement(
	Context.Consumer,
	null,
	(registry = emptyObject) => React.createElement(
		Context.Provider,
		{
			value: Object.assign(Object.create(registry), injectables),
		},
		children,
	),
);

const withInjectables = mapPropsToInjectables => Component => React.forwardRef(({ children, ...props }, ref) => React.createElement(
	Context.Consumer,
	null,
	(registry = emptyObject) => React.createElement(
		Context.Provider,
		{
			value: Object.assign(Object.create(registry), resolveMapPropsToInjectables(mapPropsToInjectables, props)),
		},
		React.createElement(
			Component,
			{
				...props,
				ref,
			},
			children,
		),
	),
));

const Inject = ({ name, props = {}, children }) => React.createElement(
	Context.Consumer,
	null,
	(registry = emptyObject) => {
		const Component = registry[name];

		invariant(Component, 'Could not find a component by name `%s`. Make sure you supplied it via `wintInjectables`.', name);

		return React.createElement(
			Component,
			props,
			props.children || children,
		);
	},
);

const withInject = mapRegistryToProps => Component => React.forwardRef((props, ref) => React.createElement(
	Context.Consumer,
	null,
	(registry = emptyObject) => {
		const extraProps = resolveMapRegistryToProps(mapRegistryToProps, registry, props);

		return React.createElement(
			Component,
			{
				...props,
				...extraProps,
				ref,
			},
			props.children,
		);
	},
));

module.exports = {
	Injectables,
	Inject,

	withInjectables,
	withInject,
};
