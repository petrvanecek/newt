class Body {
	static G = 0.000889;
	static dt = 0.1;

	constructor(name, x, y, vx, vy, mass, r, colorR, colorG, colorB) {
		this.name = name;
		this.x = x;
		this.y = y;
		this.vx = vx;
		this.vy = vy;
		this.v = Math.sqrt(this.vx**2 + this.vy**2)
		this.r = r;
		this.mass = mass;
		this.colorR = colorR;
		this.colorG = colorG;
		this.colorB = colorB;
		this.fx = 0
		this.fy = 0
		this.ax = 0
		this.ay = 0
        this.prevX = x - vx * Body.dt;
        this.prevY = y - vy * Body.dt;
	}

	computeForce(body2) {
		let distx = body2.x - this.x
		let disty = body2.y - this.y 
		let dist = Math.sqrt(distx * distx + disty * disty);
		let dirx = distx / dist;
		let diry = disty / dist;
		let f = Body.G * body2.mass * this.mass / (dist**2)
		this.fx += f * dirx
		this.fy += f * diry
		body2.fx -= f * dirx
		body2.fy -= f * diry
    }

	computePosition() {
        let ax = this.fx / this.mass;
        let ay = this.fy / this.mass;

        // new positions
        let newX = 2 * this.x - this.prevX + ax * (Body.dt * Body.dt);
        let newY = 2 * this.y - this.prevY + ay * (Body.dt * Body.dt);

        // actualize previous positions
        this.prevX = this.x;
        this.prevY = this.y;

        // set new positions
        this.x = newX;
        this.y = newY;

        // new velocity (if needed)
        this.vx = (this.x - this.prevX) / (2 * Body.dt);
        this.vy = (this.y - this.prevY) / (2 * Body.dt);
		this.v = Math.sqrt(this.vx**2 + this.vy**2)

        // reset forces
        this.fx = 0;
        this.fy = 0;
	}
	
	toString() {
		return `${this.planetName} mass ${this.mass}`;
	}

	toMongoose() {
		return {
			planetName: this.planetName,
			params: [
				this.x, this.y, this.vx, this.vy, this.r, this.mass,
				this.colorR, this.colorG, this.colorB
			],
		}
	};

	static simulate(bodies) {
		for (let i = 0; i < bodies.length - 1; ++i) 
			for (let j = i+1; j<bodies.length; ++j)
				bodies[i].computeForce(bodies[j])
	
		for (let i = 0; i < bodies.length; ++i) 
			bodies[i].computePosition()	
	}	
}

module.exports = Body;