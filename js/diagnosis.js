/**
 * AI诊断规则引擎
 * 根据8个指标数据，判断最大问题并生成诊断结果
 */

const PROBLEM_PRIORITY = {
    'arm_spread': 5,
    'jump_high': 4,
    'wrist_weak': 4,
    'rhythm_unstable': 3,
    'fatigue_drop': 3,
    'heavy_landing': 2,
    'break_frequent': 1
};

const THRESHOLDS = {
    armSpread: { low: 0.1, high: 0.3 },
    jumpHeight: { low: 0.05, high: 0.15 },
    tempoStability: { low: 0.7, high: 0.85 },
    fatigueDrop: { low: 0.15, high: 0.3 },
    wristDrive: { low: 0.3, high: 0.5 }
};

class DiagnosisResult {
    constructor() {
        this.mainProblem = null;
        this.mainProblemCode = null;
        this.mainProblemScore = 0;
        this.allProblems = [];
        this.metrics = {};
        this.diagnosis = '';
        this.prescriptionCode = null;
    }
}

function diagnose(metrics) {
    const result = new DiagnosisResult();
    result.metrics = { ...metrics };

    const problemScores = calculateProblemScores(metrics);

    const sortedProblems = Object.entries(problemScores)
        .sort((a, b) => b[1] - a[1]);

    if (sortedProblems.length > 0 && sortedProblems[0][1] > 0) {
        result.mainProblemCode = sortedProblems[0][0];
        result.mainProblemScore = sortedProblems[0][1];
        result.allProblems = sortedProblems.filter(p => p[1] > 0);
    }

    result.diagnosis = generateDiagnosisText(result.mainProblemCode, metrics);
    result.prescriptionCode = determinePrescription(result.mainProblemCode, metrics);
    result.mainProblem = getProblemName(result.mainProblemCode);

    return result;
}

function calculateProblemScores(metrics) {
    const scores = {
        arm_spread: 0,
        jump_high: 0,
        wrist_weak: 0,
        rhythm_unstable: 0,
        fatigue_drop: 0,
        heavy_landing: 0,
        break_frequent: 0
    };

    if (metrics.armSpread !== undefined) {
        if (metrics.armSpread > THRESHOLDS.armSpread.high) {
            scores.arm_spread = 90 + Math.min(10, (metrics.armSpread - THRESHOLDS.armSpread.high) * 100);
        } else if (metrics.armSpread > THRESHOLDS.armSpread.low) {
            scores.arm_spread = 50 + (metrics.armSpread - THRESHOLDS.armSpread.low) * 100;
        }
    }

    if (metrics.jumpHeight !== undefined) {
        if (metrics.jumpHeight > THRESHOLDS.jumpHeight.high) {
            scores.jump_high = 80 + Math.min(20, (metrics.jumpHeight - THRESHOLDS.jumpHeight.high) * 200);
        } else if (metrics.jumpHeight > THRESHOLDS.jumpHeight.low) {
            scores.jump_high = 40 + (metrics.jumpHeight - THRESHOLDS.jumpHeight.low) * 200;
        }
    }

    if (metrics.wristDrive !== undefined) {
        if (metrics.wristDrive < THRESHOLDS.wristDrive.low) {
            scores.wrist_weak = 85 + (THRESHOLDS.wristDrive.low - metrics.wristDrive) * 100;
        } else if (metrics.wristDrive < THRESHOLDS.wristDrive.high) {
            scores.wrist_weak = 50 + (THRESHOLDS.wristDrive.high - metrics.wristDrive) * 80;
        }
    }

    if (metrics.tempoStability !== undefined) {
        if (metrics.tempoStability < THRESHOLDS.tempoStability.low) {
            scores.rhythm_unstable = 90 + (THRESHOLDS.tempoStability.low - metrics.tempoStability) * 100;
        } else if (metrics.tempoStability < THRESHOLDS.tempoStability.high) {
            scores.rhythm_unstable = 50 + (THRESHOLDS.tempoStability.high - metrics.tempoStability) * 100;
        }
    }

    if (metrics.fatigueDrop !== undefined) {
        if (metrics.fatigueDrop > THRESHOLDS.fatigueDrop.high) {
            scores.fatigue_drop = 80 + Math.min(20, (metrics.fatigueDrop - THRESHOLDS.fatigueDrop.high) * 100);
        } else if (metrics.fatigueDrop > THRESHOLDS.fatigueDrop.low) {
            scores.fatigue_drop = 40 + (metrics.fatigueDrop - THRESHOLDS.fatigueDrop.low) * 100;
        }
    }

    if (metrics.jumpHeight !== undefined && metrics.jumpHeight > THRESHOLDS.jumpHeight.low) {
        scores.heavy_landing = metrics.jumpHeight * 80;
    }

    if (metrics.breakCount !== undefined && metrics.breakCount > 0) {
        scores.break_frequent = Math.min(100, 50 + metrics.breakCount * 15);
    }

    if (scores.arm_spread > 50 && scores.rhythm_unstable > 50) {
        scores.arm_spread += 20;
        scores.rhythm_unstable -= 10;
    }

    if (scores.jump_high > 50 && scores.fatigue_drop > 50) {
        scores.jump_high += 15;
    }

    if (scores.wrist_weak > 50 && scores.arm_spread > 50) {
        scores.wrist_weak += 15;
        scores.arm_spread -= 5;
    }

    return scores;
}

function generateDiagnosisText(mainProblem, metrics) {
    const templates = {
        'arm_spread': () => {
            const severity = metrics.armSpread > 0.4 ? '严重' : '明显';
            return `你的主要问题是手臂${severity}外展，绳路变大导致速度上不去。`;
        },
        'jump_high': () => {
            const severity = metrics.jumpHeight > 0.2 ? '过高，体力浪费很大' : '偏高，部分体力浪费';
            return `你的主要问题是起跳${severity}。降低起跳高度可以明显提升成绩。`;
        },
        'wrist_weak': () => {
            return '你的主要问题是手腕发力不足，大臂在甩绳，效率低。';
        },
        'rhythm_unstable': () => {
            return '你的主要问题是节奏不稳，容易断绳或踩绳。';
        },
        'fatigue_drop': () => {
            const drop = Math.round(metrics.fatigueDrop * 100);
            return `你的主要问题是后半段掉速约${drop}%，耐力或动作经济性需要提升。`;
        },
        'heavy_landing': () => {
            return '你的主要问题是落地偏重，消耗了不必要的体力。';
        },
        'break_frequent': () => {
            return `你本次断绳${metrics.breakCount}次，是影响成绩的主要原因。`;
        },
        'comprehensive': () => {
            return '你的动作整体还行，继续练习保持节奏就好。';
        }
    };

    const generator = templates[mainProblem] || templates['comprehensive'];
    return generator();
}

function determinePrescription(mainProblem, metrics) {
    if (metrics.breakCount > 2) {
        return 'break_frequent';
    }
    return mainProblem || 'comprehensive';
}

function getProblemName(problemCode) {
    const names = {
        'arm_spread': '手臂外展',
        'jump_high': '起跳过高',
        'wrist_weak': '手腕发力不足',
        'rhythm_unstable': '节奏不稳',
        'fatigue_drop': '后半段掉速',
        'heavy_landing': '落地偏重',
        'break_frequent': '断绳频繁',
        'comprehensive': '综合待提升'
    };
    return names[problemCode] || '综合待提升';
}

function getMetricRating(metricName, value) {
    const ratings = {
        tempoStability: { good: 0.85, warning: 0.7 },
        fatigueDrop: { good: 0.15, warning: 0.3 },
        armSpread: { good: 0.1, warning: 0.3 },
        jumpHeight: { good: 0.08, warning: 0.15 }
    };

    const config = ratings[metricName];
    if (!config) return 'warning';

    if (metricName === 'fatigueDrop') {
        if (value <= config.good) return 'good';
        if (value <= config.warning) return 'warning';
        return 'bad';
    } else {
        if (value <= config.good) return 'good';
        if (value <= config.warning) return 'warning';
        return 'bad';
    }
}

function formatMetricValue(metricName, value) {
    if (value === undefined || value === null) return '--';

    switch (metricName) {
        case 'tempoStability':
            return Math.round(value * 100) + '%';
        case 'fatigueDrop':
            return Math.round(value * 100) + '%';
        case 'armSpread':
        case 'jumpHeight':
            return (value * 100).toFixed(1) + '%';
        case 'avgTempo':
            return value.toFixed(1);
        case 'wristDrive':
            return Math.round(value * 100) + '%';
        default:
            return value.toString();
    }
}
