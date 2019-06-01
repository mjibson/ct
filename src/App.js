import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import 'tachyons/css/tachyons.min.css';
import './App.css';
import iba from './iba';
import other from './other';
import { gredImplies, isAlcohol } from './util';

const drinks = {};
Object.assign(drinks, iba);
Object.assign(drinks, other);

const allGreds = {};
Object.values(drinks).forEach(v =>
	v.ShortGreds.forEach(g => {
		allGreds[g] = (allGreds[g] || 0) + 1;
	})
);

const colClass = 'flex-wrap pa1 mr1';

class Index extends Component {
	constructor(props) {
		const gredsByCount = Object.keys(allGreds);
		gredsByCount
			.sort((a, b) => {
				return allGreds[a] - allGreds[b];
			})
			.reverse();
		super(props);
		const have = JSON.parse(localStorage.getItem('have') || '{}');
		Object.keys(have).forEach(v => {
			if (!allGreds[v]) {
				delete have[v];
			}
		});
		this.state = {
			allGreds: allGreds,
			gredsByCount: gredsByCount,
			checked: have,
			have: {},
			make: [],
			could: [],
		};
	}
	componentDidMount() {
		this.update();
	}
	update = () => {
		const make = [];
		const could = [];
		const have = Object.assign({}, this.state.checked);
		Object.keys(have).forEach(g => {
			const imp = gredImplies(g).filter(v => allGreds[v]);
			imp.forEach(v => {
				have[v] = true;
			});
		});
		Object.values(drinks).forEach(drink => {
			const missing = [];
			drink.ShortGreds.forEach(v => {
				if (!have[v]) {
					missing.push(v);
				}
			});
			if (!missing.length) {
				make.push(drink);
			} else if (
				missing.length <= 2 &&
				drink.ShortGreds.length > missing.length
			) {
				could.push(Object.assign({ missing: missing }, drink));
			}
		});
		make.sort((a, b) => a.Name.localeCompare(b.Name));
		could.sort((a, b) => {
			if (a.missing.length !== b.missing.length) {
				return a.missing.length - b.missing.length;
			}
			return a.Name.localeCompare(b.Name);
		});
		this.setState({ make: make, could: could, have: have });
	};
	clickGred = v => {
		const checked = this.state.checked;
		if (v.target.checked) {
			checked[v.target.name] = true;
		} else {
			delete checked[v.target.name];
		}
		localStorage.setItem('have', JSON.stringify(checked));
		this.setState({ checked: checked }, this.update);
	};
	renderGred = v => {
		return (
			<div className="mb1" key={v}>
				<label>
					<input
						type="checkbox"
						name={v}
						onChange={this.clickGred}
						checked={!!this.state.checked[v]}
					/>
					&nbsp;
					<GredLink Name={v} />
				</label>
			</div>
		);
	};
	render() {
		const have = Object.keys(this.state.have)
			.sort()
			.map(v => (
				<div className="mb1" key={v}>
					<GredLink Name={v} />
				</div>
			));
		const gredsAlch = this.state.gredsByCount
			.filter(isAlcohol)
			.map(this.renderGred);
		const gredsOther = this.state.gredsByCount
			.filter(v => !isAlcohol(v))
			.map(this.renderGred);
		const make = this.state.make.map(v => (
			<div key={v.Name} className="ma2 lh-copy">
				<DrinkLink {...v} /> {GredList(v.ShortGreds)}
			</div>
		));
		const could = this.state.could.map(v => (
			<div key={v.Name} className="mv2 lh-copy">
				<DrinkLink {...v} /> {GredList(v.missing)}
			</div>
		));
		const borderClass = ' br b--white-20';
		return (
			<div className="flex">
				<div className={colClass + borderClass}>
					<h2>ingredients</h2>
					<h4>alcohols</h4>
					{gredsAlch}
					<h4>other</h4>
					{gredsOther}
				</div>
				<div className={colClass + borderClass}>
					<h2>have</h2>
					{have}
				</div>
				<div className={colClass + borderClass}>
					<h2>can make</h2>
					<div className=" indent-n2em">{make}</div>
				</div>
				<div className={colClass}>
					<h2>could make</h2>
					missing ingredients shown
					<div className="">{could}</div>
				</div>
			</div>
		);
	}
}

// https://stackoverflow.com/a/23619085/864236
function intersperse(arr, sep) {
	if (arr.length === 0) {
		return [];
	}

	return arr.slice(1).reduce(
		function(xs, x, i) {
			return xs.concat([sep, x]);
		},
		[arr[0]]
	);
}

function DrinkLink(props) {
	return (
		<Link
			className="br2 ph1 pv1 black bg-primary no-underline"
			to={'/drink/' + props.Name}
		>
			{props.Name}
		</Link>
	);
}

function GredList(greds) {
	return intersperse(greds.map(v => <GredLink key={v} Name={v} />), ', ');
}

function GredLink(props) {
	return (
		<Link className="primary" to={'/gred/' + props.Name}>
			{props.Name}
		</Link>
	);
}

function Drink({ match }) {
	const d = drinks[match.params.name];
	if (!d) {
		//return 'unknown';
	}
	return (
		<div className={colClass}>
			<h2>
				<Link to="/">drinks</Link> &gt; {d.Name}
			</h2>
			<h4>ingredients</h4>
			{d.Greds.map(v => (
				<div key={v}>{v}</div>
			))}
			<h4>preparation</h4>
			<div className="mw6">{d.Prep}</div>
			<h4>other drinks with:</h4>
			{d.ShortGreds.map(v => (
				<div key={v}>
					<GredLink Name={v} />
				</div>
			))}
			{d.Link ? (
				<h5>
					<a href={d.Link}>{d.Link}</a>
				</h5>
			) : null}
		</div>
	);
}

function Gred({ match }) {
	const gred = match.params.name;
	const made = Object.values(drinks)
		.filter(v => v.ShortGreds.includes(gred))
		.sort((a, b) => a.Name.localeCompare(b.Name));
	return (
		<div className={colClass}>
			<h2>
				<Link to="/">drinks</Link> &gt; {gred}
			</h2>
			<h4>
				drinks made with {gred} ({made.length}):
			</h4>
			{made.map(v => (
				<div key={v.Name} className="mb2">
					<DrinkLink {...v} />
				</div>
			))}
		</div>
	);
}

function App() {
	return (
		<Router>
			<div className="sans-serif">
				<Route path="/" exact component={Index} />
				<Route path="/drink/:name" component={Drink} />
				<Route path="/gred/:name" component={Gred} />
			</div>
		</Router>
	);
}

export default App;
