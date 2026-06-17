/**
 * 数据存储模块
 * 使用 LocalStorage 保存测试历史和进度
 */

const Storage = {
    KEY_PREFIX: 'ai_coach_',
    HISTORY_KEY: 'ai_coach_history',
    SETTINGS_KEY: 'ai_coach_settings',
    MAX_HISTORY: 100,

    /**
     * 保存测试结果
     */
    saveResult(result) {
        const history = this.getHistory();

        const record = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            count: result.count,
            metrics: result.metrics,
            diagnosis: result.diagnosis,
            prescriptionCode: result.prescriptionCode,
            grade: this.calculateGrade(result.count)
        };

        history.unshift(record); // 添加到开头

        // 限制最大数量
        if (history.length > this.MAX_HISTORY) {
            history.pop();
        }

        localStorage.setItem(this.HISTORY_KEY, JSON.stringify(history));
        return record;
    },

    /**
     * 获取测试历史
     */
    getHistory() {
        try {
            const data = localStorage.getItem(this.HISTORY_KEY);
            return data ? JSON.parse(data) : [];
        } catch {
            return [];
        }
    },

    /**
     * 获取最近N次测试
     */
    getRecentHistory(count = 10) {
        return this.getHistory().slice(0, count);
    },

    /**
     * 获取今日测试
     */
    getTodayHistory() {
        const today = new Date().toDateString();
        return this.getHistory().filter(record => {
            return new Date(record.timestamp).toDateString() === today;
        });
    },

    /**
     * 获取本周测试
     */
    getWeekHistory() {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return this.getHistory().filter(record => {
            return new Date(record.timestamp) >= weekAgo;
        });
    },

    /**
     * 获取最佳成绩
     */
    getBestRecord() {
        const history = this.getHistory();
        if (history.length === 0) return null;

        return history.reduce((best, current) => {
            return current.count > best.count ? current : best;
        });
    },

    /**
     * 获取进步数据（用于曲线图）
     */
    getProgressData(days = 7) {
        const history = this.getHistory();
        const now = new Date();
        const data = [];

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const dateStr = date.toDateString();

            const dayRecords = history.filter(r => {
                return new Date(r.timestamp).toDateString() === dateStr;
            });

            if (dayRecords.length > 0) {
                const avg = dayRecords.reduce((sum, r) => sum + r.count, 0) / dayRecords.length;
                const best = Math.max(...dayRecords.map(r => r.count));
                data.push({
                    date: date,
                    dateStr: `${date.getMonth() + 1}/${date.getDate()}`,
                    avg: Math.round(avg),
                    best: best,
                    count: dayRecords.length
                });
            } else {
                data.push({
                    date: date,
                    dateStr: `${date.getMonth() + 1}/${date.getDate()}`,
                    avg: null,
                    best: null,
                    count: 0
                });
            }
        }

        return data;
    },

    /**
     * 计算进步幅度
     */
    getImprovement() {
        const history = this.getHistory();
        if (history.length < 2) return null;

        const latest = history[0];
        const previous = history.find((r, i) => i > 0 && r.timestamp !== latest.timestamp);

        if (!previous) return null;

        const countDiff = latest.count - previous.count;
        const percentChange = ((countDiff / previous.count) * 100).toFixed(1);

        return {
            latest: latest.count,
            previous: previous.count,
            diff: countDiff,
            percent: Math.abs(percentChange),
            isImproved: countDiff > 0
        };
    },

    /**
     * 获取问题分布统计
     */
    getProblemDistribution() {
        const history = this.getHistory();
        const distribution = {};

        history.forEach(record => {
            const problem = record.diagnosis?.mainProblemCode || 'unknown';
            distribution[problem] = (distribution[problem] || 0) + 1;
        });

        return distribution;
    },

    /**
     * 获取统计数据
     */
    getStats() {
        const history = this.getHistory();
        const today = this.getTodayHistory();
        const week = this.getWeekHistory();

        const stats = {
            total: history.length,
            todayCount: today.length,
            weekCount: week.length,
            best: null,
            avg: 0,
            todayAvg: 0,
            weekAvg: 0,
            totalImprove: 0
        };

        if (history.length > 0) {
            stats.best = Math.max(...history.map(r => r.count));
            stats.avg = Math.round(history.reduce((sum, r) => sum + r.count, 0) / history.length);
        }

        if (today.length > 0) {
            stats.todayAvg = Math.round(today.reduce((sum, r) => sum + r.count, 0) / today.length);
        }

        if (week.length > 0) {
            stats.weekAvg = Math.round(week.reduce((sum, r) => sum + r.count, 0) / week.length);
        }

        // 计算总进步次数
        for (let i = 1; i < Math.min(history.length, 10); i++) {
            if (history[i-1].count > history[i].count) {
                stats.totalImprove++;
            }
        }

        return stats;
    },

    /**
     * 清除历史
     */
    clearHistory() {
        localStorage.removeItem(this.HISTORY_KEY);
    },

    /**
     * 计算等级
     */
    calculateGrade(count) {
        if (count >= 100) return 'S';
        if (count >= 85) return 'A';
        if (count >= 70) return 'B';
        if (count >= 55) return 'C';
        if (count >= 40) return 'D';
        return 'E';
    },

    /**
     * 获取设置
     */
    getSettings() {
        try {
            const data = localStorage.getItem(this.SETTINGS_KEY);
            return data ? JSON.parse(data) : this.getDefaultSettings();
        } catch {
            return this.getDefaultSettings();
        }
    },

    /**
     * 保存设置
     */
    saveSettings(settings) {
        localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
    },

    /**
     * 默认设置
     */
    getDefaultSettings() {
        return {
            voiceEnabled: true,
            voiceVolume: 0.8,
            testDuration: 30,
            showWaveform: true,
            darkMode: true
        };
    }
};

// 导出
window.Storage = Storage;
