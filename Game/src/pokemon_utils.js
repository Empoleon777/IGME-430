import * as basic_utils from "./basic_utils.js";

class Pokémon extends basic_utils.Agent {
    constructor(x, y) {
        // The properties of the Pokémon. These are pre-declared here, then 
        // loaded elsewhere.
        this.name;
        this.type1;
        this.type2;
        this.height;
        this.weight;
        this.baseHP;
        this.baseAttack;
        this.baseDefense;
        this.baseSpecialAttack;
        this.baseSpecialDefense;
        this.baseSpeed;
        this.currStatus;
        this.moveList = [];

        // The sprites are stored here.        
        this.moveSprite1;
        this.moveSprite2;
        this.moveSprite3;
        this.moveSprite4;
        this.moveSprite5;
        this.moveSprite6;
        this.moveSprite7;
        this.moveSprite8;

        // The actual stats.
        this.maxHP;
        this.attack;
        this.defense;
        this.specialAttack;
        this.specialDefense;
        this.speed;

        // Other significant fields for stat calculations are below.

        // These are IVs.
        this.HPIV;
        this.attackIV;
        this.defenseIV;
        this.specialAttackIV;
        this.specialDefenseIV;
        this.speedIV;

        // These are EVs.
        this.HPEV;
        this.attackEV;
        this.defenseEV;
        this.specialAttackEV;
        this.specialDefenseEV;
        this.speedEV;

        // This is the nature. Some natures do nothing, but most boost one stat
        // at the cost of lowering another (All of these will be 1, but one may
        // be raised to 1.1 at the cost of another being lowered to 0.9).
        this.nature;
        this.attackNature;
        this.defenseNature;
        this.specialAttackNature;
        this.specialDefenseNature;
        this.speedNature;

        // This is the user's level.
        this.level;

        this.calcStats();

        // These variables hold the current state of a stat. Most of the time, 
        // these will be equivalent to the stats calculated above, but these 
        // variables account for boosts, drops, et cetera.
        this.currHP = this.maxHP;
        this.currAttack = this.attack;
        this.currDefense = this.defense;
        this.currSpecialAttack = this.specialAttack;
        this.currSpecialDefense = this.specialDefense;
        this.currSpeed = this.speed;

        // These variables represent buffs and debuffs.
        this.attackStage = 0;
        this.defenseStage = 0;
        this.specialAttackStage = 0;
        this.specialDefenseStage = 0;
        this.speedStage = 0;

        // Other important variables are handled here.
        this.x = x;
        this.y = y;
        this.velocity;
        this.direction;
        this.acceleration;
        this.rotation;
        this.range;
        this.animationStep = 1;
    }

    calcStats() {
        this.maxHP = Math.floor((2 * this.baseHP + this.HPIV + Math.floor(this.HPEV / 4) * this.level) / 100) + this.level + 10;
        this.attack = Math.floor(((2 * this.baseAttack + this.attackIV + Math.floor(this.attackEV / 4) * this.level) / 100 + 5) * attackNature);
        this.defense = Math.floor(((2 * this.baseDefense + this.defenseIV + Math.floor(this.defenseEV / 4) * this.level) / 100 + 5) * defenseNature);
        this.specialAttack = Math.floor(((2 * this.baseSpecialAttack + this.specialAttackIV + Math.floor(this.specialAttackEV / 4) * this.level) / 100 + 5) * specialAttackNature);
        this.specialDefense = Math.floor(((2 * this.baseSpecialDefense + this.specialDefenseIV + Math.floor(this.specialDefenseEV / 4) * this.level) / 100 + 5) * specialDefenseNature);
        this.speed = Math.floor(((2 * this.baseSpeed + this.speedIV + Math.floor(this.speedEV / 4) * this.level) / 100 + 5) * speedNature);
    }

    step(animTime) {
        if (animTime == 0 && animationStep == 1) {
            animationStep = 2;
        }
        else if (animTime == 0 && animationStep == 2) {
            animationStep = 1;
        }
    }

    animate() {
        
    }

    load() {

    }
}

class MoveData extends basic_utils.Agent {
    constructor() {
        this.name;
        this.category;
        this.basePower;
        this.type;
        this.effectChance;
        this.cooldown;
        this.currCooldown = 0;
    }

    load() {

    }

    use(user) {
        new MoveSprite(this, user);
    }
}

class MoveSprite {
    constructor(move, user) {
        this.name = move.name;
        this.category = move.category;
        this.basePower = move.basePower;
        this.type = move.type;
        this.ranged;
        this.effectChance = move.effectChance;

        if (move.category === "Physical") {
            this.attackingStat = user.currAttack;
        }
        else if (move.category === "Special") {
            this.attackingStat = user.currSpecialAttack;
        }
        else {
            this.attackingStat = 0;
        }
    }
}