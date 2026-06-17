/**
 * 语音提示模块
 * 使用 Web Speech API 实现语音播报
 */

const Voice = {
    enabled: true,
    volume: 0.8,
    speechSynth: null,

    /**
     * 初始化
     */
    init() {
        if ('speechSynthesis' in window) {
            this.speechSynth = window.speechSynthesis;
            this.enabled = true;
        } else {
            this.enabled = false;
            console.warn('浏览器不支持语音合成');
        }
    },

    /**
     * 说话
     */
    speak(text, options = {}) {
        if (!this.enabled || !this.speechSynth) return;

        // 停止之前的语音
        this.stop();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'zh-CN';
        utterance.volume = options.volume || this.volume;
        utterance.rate = options.rate || 1;
        utterance.pitch = options.pitch || 1;

        // 选择中文语音
        const voices = this.speechSynth.getVoices();
        const chineseVoice = voices.find(v => v.lang.includes('zh'));
        if (chineseVoice) {
            utterance.voice = chineseVoice;
        }

        this.speechSynth.speak(utterance);
    },

    /**
     * 停止说话
     */
    stop() {
        if (this.speechSynth) {
            this.speechSynth.cancel();
        }
    },

    /**
     * 播报倒计时
     */
    countdown(num) {
        if (num === 0) {
            this.speak('开始');
        } else {
            this.speak(num.toString());
        }
    },

    /**
     * 播报测试开始
     */
    testStart() {
        this.speak('测试开始');
    },

    /**
     * 播报测试结束
     */
    testEnd(count) {
        this.speak(`测试结束，共跳了 ${count} 次`);
    },

    /**
     * 播报诊断结果
     */
    diagnosis(diagnosisText) {
        // 简化诊断文本
        const simplified = diagnosisText.replace(/你的/g, '').replace(/主要问题是/g, '');
        this.speak(simplified);
    },

    /**
     * 播报鼓励语
     */
    encouragement() {
        const phrases = [
            '加油，继续保持',
            '节奏很稳',
            '不错，继续努力',
            '很好，保持这个状态'
        ];
        const phrase = phrases[Math.floor(Math.random() * phrases.length)];
        this.speak(phrase);
    },

    /**
     * 播报时间提醒
     */
    timeReminder(remaining) {
        if (remaining === 10) {
            this.speak('还剩10秒');
        } else if (remaining === 5) {
            this.speak('5');
        } else if (remaining === 3) {
            this.speak('3');
        }
    },

    /**
     * 播报进步
     */
    improvement(diff) {
        if (diff > 0) {
            this.speak(`进步了 ${diff} 次，继续加油`);
        } else if (diff < 0) {
            this.speak(`比上次少了 ${Math.abs(diff)} 次，没关系，再接再厉`);
        } else {
            this.speak('和上次一样，保持住');
        }
    }
};

// 导出
window.Voice = Voice;
