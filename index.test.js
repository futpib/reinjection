
import test from 'ava';

import React from 'react';
import { mount } from 'enzyme';
import {
	Injectables,
	Inject,
	withInjectables,
	withInject,
} from '.';

const renderChildren = ({ children }) => children;

const Div = ({ children, ...props }) => (
	<div {...props}>{children}</div>
);

const Span = 'span';

class Refable extends React.Component {
	render() {
		const { children } = this.props;

		return (
			<>
				refable(
				{children}
				)
			</>
		);
	}
}

const elementUsingInjectedDivAndSpan = (
	<Inject
		name="Div"
		props={{
			className: 'divClass',
		}}
	>
		foo
		<Inject
			name="Span"
			props={{
				className: 'spanClass',
			}}
		>
			bar
		</Inject>
		buz
	</Inject>
);

test('no registered components', t => {
	t.throws(() => {
		mount(
			<Inject
				name="A"
			/>
		);
	}, /Could not find a component/);
});

test('wrong component name', t => {
	t.throws(() => {
		mount(
			<Injectables
				injectables={{
					B: () => 'B',
				}}
			>
				<Inject
					name="A"
				/>
			</Injectables>
		);
	}, /Could not find a component/);
});

test('wrong component name (HOC)', t => {
	const Injectables = withInjectables({
		B: () => 'B',
	})(renderChildren);

	t.throws(() => {
		mount(
			<Injectables>
				<Inject
					name="A"
				/>
			</Injectables>
		);
	}, /Could not find a component/);
});

test('inject components', t => {
	const wrapper = mount(
		<Injectables
			injectables={{
				Div,
				Span,
			}}
		>
			{elementUsingInjectedDivAndSpan}
		</Injectables>
	);

	t.snapshot(wrapper.html());
});

test('inject components (HOCs)', t => {
	const Injectables = withInjectables({
		Div,
		Span,
	})(renderChildren);

	const wrapper = mount(
		<Injectables>
			{elementUsingInjectedDivAndSpan}
		</Injectables>
	);

	t.snapshot(wrapper.html());
});

test('inject components (HOCs, injectables depending on props)', t => {
	const Injectables = withInjectables(
		({ swapDivAndSpan }) => swapDivAndSpan ? {
			Div: Span,
			Span: Div,
		} : {
			Div,
			Span,
		}
	)(renderChildren);

	const wrapper = mount(
		<Injectables>
			{elementUsingInjectedDivAndSpan}
		</Injectables>
	);

	t.snapshot(wrapper.html());

	wrapper.setProps({
		swapDivAndSpan: true,
	});

	t.snapshot(wrapper.html(), 'swapDivAndSpan');
});

test('inject components into props', t => {
	const DivSpan = withInject([
		'Div',
		'Span',
	])(({ Div, Span, children }) => (
		<Div>
			<Span>
				{children}
			</Span>
		</Div>
	));

	const wrapper = mount(
		<Injectables
			injectables={{
				Div,
				Span,
			}}
		>
			<DivSpan>foo</DivSpan>
		</Injectables>
	);

	t.snapshot(wrapper.html());
});

test('inject components into props (depending on props)', t => {
	const DivSpan = withInject(({ Div, Span }, { swapDivAndSpan }) => swapDivAndSpan ? {
		Div: Span,
		Span: Div,
	} : {
		Div,
		Span,
	})(({ Div, Span, children }) => (
		<Div>
			<Span>
				{children}
			</Span>
		</Div>
	));

	const wrapper = mount(
		<Injectables
			injectables={{
				Div,
				Span,
			}}
		>
			<DivSpan>foo</DivSpan>
		</Injectables>
	);

	t.snapshot(wrapper.html());

	const wrapperSwapped = mount(
		<Injectables
			injectables={{
				Div,
				Span,
			}}
		>
			<DivSpan
				swapDivAndSpan
			>
				foo
			</DivSpan>
		</Injectables>
	);

	t.snapshot(wrapperSwapped.html(), 'swapDivAndSpan');
});

test('ref forwarding', t => {
	const A = withInjectables({})(Refable);
	const B = withInject([])(Refable);

	const aRef = React.createRef();
	const bRef = React.createRef();

	// `<div>` below is a workaround for https://github.com/airbnb/enzyme/issues/1852
	mount(
		<div>
			<A
				ref={aRef}
			>
				<B ref={bRef}/>
			</A>
		</div>
	);

	t.true(aRef.current instanceof Refable);
	t.true(bRef.current instanceof Refable);
	t.true(aRef.current !== bRef.current);
});
