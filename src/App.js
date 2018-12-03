import React, { Component } from 'react';
import 'tachyons/css/tachyons.min.css';
import './App.css';
import drinks from './drinks';

const allGreds = {};
Object.values(drinks).forEach(v =>
	v.ShortGreds.forEach(g => {
		allGreds[g] = (allGreds[g] || 0) + 1;
	})
);

const colClass = 'flex-wrap pa1 mr1';

class App extends Component {
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
			have: have,
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
		Object.values(drinks).forEach(drink => {
			const missing = [];
			drink.ShortGreds.forEach(v => {
				if (!this.state.have[v]) {
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
		this.setState({ make: make, could: could });
	};
	clickGred = v => {
		const have = this.state.have;
		if (v.target.checked) {
			have[v.target.name] = true;
		} else {
			delete have[v.target.name];
		}
		localStorage.setItem('have', JSON.stringify(have));
		this.setState({ have: have }, this.update);
	};
	render() {
		const have = Object.keys(this.state.have)
			.sort()
			.map(v => (
				<div className="ma2" key={v}>
					{v}
					&nbsp;(
					{this.state.allGreds[v]})
				</div>
			));
		const greds = this.state.gredsByCount.map(v => (
			<div className="ma2" key={v}>
				<label>
					<input
						type="checkbox"
						name={v}
						onChange={this.clickGred}
						checked={!!this.state.have[v]}
					/>{' '}
					{v}
					&nbsp;(
					{this.state.allGreds[v]})
				</label>
			</div>
		));
		const make = this.state.make.map(v => (
			<div key={v.Name} className="ma2">
				<a href={v.Link}>{v.Name}</a>: {v.ShortGreds.join(', ')}
			</div>
		));
		const could = this.state.could.map(v => (
			<div key={v.Name} className="ma2">
				<a href={v.Link}>{v.Name}</a>
				&nbsp;(
				{v.missing.length}
				): {v.missing.join(', ')}
			</div>
		));
		return (
			<div className="sans-serif flex">
				<div className={colClass + ' br'}>
					possible ingredients:
					{greds}
				</div>
				<div className={colClass + ' br'}>
					have:
					{have}
				</div>
				<div className={colClass + ' br'}>
					can make:
					<div className=" indent-n2em">{make}</div>
				</div>
				<div className={colClass}>
					could make (missing ingredients shown):
					<div className="">{could}</div>
				</div>
			</div>
		);
	}
}

export default App;
