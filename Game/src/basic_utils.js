class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.magnitude = Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
    }

    // Recalculates the magnitude of the vector.
    recalcMagnitude() {
        this.magnitude = Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
    }

    // Normalizes the vector.
    normalize() {
        this.x /= this.magnitude;
        this.y /= this.magnitude;
    }

    // Performs scalar multiplication.
    scale(num) {
        this.x *= num;
        this.y *= num;
    }
}

class Agent {
    constructor() {
        this.velocity = new Vector(0, 0);
        this.direction = new Vector(0, 0);
        this.acceleration = new Vector(0, 0);
        this.position = new Vector(0, 0);
    }

    // Controls movement.
    update() {
        this.velocity.x + this.acceleration.x;
        this.velocity.y + this.acceleration.y;
        this.direction.x = this.velocity.x;
        this.direction.y = this.velocity.y;
        this.direction.normalize();
        this.acceleration.x = 0;
        this.acceleration.y = 0;
    }

    // Applies a force.
    applyForce(force, mass) {
        this.acceleration += force / mass;
    }
}

// Calculates the dot product of two vectors.
function dotProduct(vectorA, vectorB) {
    return vectorA.x * vectorB.x + vectorA.y * vectorB.y;
}

// Calculates the angle between two vectors.
function calcAngle(vectorA, vectorB) {
    let dot = dotProduct(vectorA, vectorB);
    return Math.acos(dot) / vectorA.magnitude / vectorB.magnitude;
}

export { Vector, Agent, dotProduct, calcAngle }