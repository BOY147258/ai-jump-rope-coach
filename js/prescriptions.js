/**
 * 训练处方库
 * 根据8个诊断指标的问题类型，返回对应的训练处方
 */

const PrescriptionDB = {
    // 起跳过高
    'jump_high': {
        title: '低弹跳训练',
        icon: '🦘',
        description: '脚尖轻点地，身体上下幅度尽量小',
        detail: '20秒 × 3组，组间休息10秒\n要求：着地声音尽量轻，膝盖微屈缓冲',
        duration: 180,
        sets: 3,
        interval: 10
    },

    // 手臂外展
    'arm_spread': {
        title: '夹肘跳训练',
        icon: '🤲',
        description: '肘部靠近身体，减少无效做功',
        detail: '30秒 × 3组，组间休息15秒\n要求：双手持绳，手肘贴紧身体两侧',
        duration: 180,
        sets: 3,
        interval: 15
    },

    // 手腕发力不足
    'wrist_weak': {
        title: '手腕发力训练',
        icon: '💪',
        description: '无绳手腕快转 + 有绳慢跳交替',
        detail: '无绳手腕快转30秒 → 有绳慢跳30秒 → 休息15秒\n做3轮，总计约2分45秒',
        duration: 180,
        sets: 3,
        interval: 15
    },

    // 节奏不稳
    'rhythm_unstable': {
        title: '节拍器训练',
        icon: '🎵',
        description: '跟随节拍稳定节奏，减少断绳',
        detail: '第一轮：120BPM 30秒\n第二轮：140BPM 30秒\n第三轮：160BPM 30秒\n组间休息15秒',
        duration: 180,
        sets: 3,
        interval: 15
    },

    // 后半段掉速
    'fatigue_drop': {
        title: '节奏保持训练',
        icon: '⚡',
        description: '15秒稳跳 + 15秒加速 + 15秒保持',
        detail: '每个循环45秒，做3组，组间休息15秒\n目标：后半段不掉速，与前半段节奏接近',
        duration: 180,
        sets: 3,
        interval: 15
    },

    // 落地重
    'heavy_landing': {
        title: '静音跳训练',
        icon: '🔇',
        description: '尽量让落地声音变小，提高动作经济性',
        detail: '20秒 × 3组，组间休息10秒\n专注：脚尖先着地，膝盖微屈缓冲',
        duration: 180,
        sets: 3,
        interval: 10
    },

    // 断绳频繁
    'break_frequent': {
        title: '断点修正训练',
        icon: '🔄',
        description: '识别断绳原因，针对性修正',
        detail: '先看断绳前3秒回放，分析原因\n然后放慢速度重新练习对应动作\n30秒 × 3组',
        duration: 180,
        sets: 3,
        interval: 15
    },

    // 综合问题
    'comprehensive': {
        title: '综合提升训练',
        icon: '🎯',
        description: '针对多个问题综合训练',
        detail: '第1分钟：节拍器120BPM热身\n第2分钟：夹肘低跳专注节奏\n第3分钟：全力冲刺保持节奏',
        duration: 180,
        sets: 3,
        interval: 0
    }
};

function getPrescription(problemCode) {
    return PrescriptionDB[problemCode] || PrescriptionDB['comprehensive'];
}

function getPrescriptionContent(problemCode) {
    const prescription = getPrescription(problemCode);
    return {
        title: prescription.title,
        icon: prescription.icon,
        description: prescription.description,
        detail: prescription.detail
    };
}

function getTrainingDuration(problemCode) {
    const prescription = getPrescription(problemCode);
    if (prescription.sets === 3 && prescription.interval > 0) {
        return prescription.sets * 30 + (prescription.sets - 1) * prescription.interval;
    }
    return prescription.duration;
}
