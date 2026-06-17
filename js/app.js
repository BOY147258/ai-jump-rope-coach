/**
 * 体智汇AI单摇提分教练 - 主应用
 */

const DEMO_DATA = {
    students: [
        { id: 1, name: '张小明', class: 'class1', count: 85, mainProblem: 'arm_spread', improvement: 12 },
        { id: 2, name: '李小红', class: 'class1', count: 92, mainProblem: 'jump_high', improvement: 8 },
        { id: 3, name: '王小华', class: 'class1', count: 78, mainProblem: 'rhythm_unstable', improvement: 5 },
        { id: 4, name: '刘小强', class: 'class1', count: 95, mainProblem: 'fatigue_drop', improvement: 3 },
        { id: 5, name: '陈小丽', class: 'class1', count: 88, mainProblem: 'wrist_weak', improvement: 15 },
        { id: 6, name: '杨小杰', class: 'class1', count: 72, mainProblem: 'arm_spread', improvement: 0 },
        { id: 7, name: '赵小雨', class: 'class1', count: 98, mainProblem: 'jump_high', improvement: 10 },
        { id: 8, name: '孙小鹏', class: 'class1', count: 82, mainProblem: 'rhythm_unstable', improvement: 7 }
    ],
    breaks: [
        { student: '张小明', time: '14:32', reason: '手腕偏移' },
        { student: '王小华', time: '14:28', reason: '节奏突变' },
        { student: '杨小杰', time: '14:25', reason: '手臂外展过大' }
    ]
};

class JumpRopeCoachApp {
    constructor() {
        this.analyzer = null;
        this.currentMode = 'student';
        this.currentClass = null;
        this.currentStudent = null;
        this.lastResult = null;
        this.trainingTimer = null;
        this.trainingRemaining = 180;
        this.testTimer = null;
        this.demoMode = false;
        this.demoInterval = null;
        this.elements = {};
        this.init();
    }

    init() {
        this.cacheElements();
        this.bindEvents();
        this.checkCameraSupport();
        this.renderTeacherDashboard();
    }

    cacheElements() {
        this.elements.classSelector = document.getElementById('class-selector');
        this.elements.studentName = document.getElementById('student-name');
        this.elements.startTestBtn = document.getElementById('start-test-btn');
        this.elements.classSelect = document.getElementById('class-select');
        this.elements.testArea = document.getElementById('test-area');
        this.elements.cameraPreview = document.getElementById('camera-preview');
        this.elements.poseCanvas = document.getElementById('pose-canvas');
        this.elements.countdownOverlay = document.getElementById('countdown-overlay');
        this.elements.countdownNumber = document.getElementById('countdown-number');
        this.elements.liveCount = document.getElementById('live-count');
        this.elements.liveTempo = document.getElementById('live-tempo');
        this.elements.stopTestBtn = document.getElementById('stop-test-btn');
        this.elements.testTimerDisplay = document.getElementById('timer-display');
        this.elements.diagnosisResult = document.getElementById('diagnosis-result');
        this.elements.trainingArea = document.getElementById('training-area');
        this.elements.teacherClassSelector = document.getElementById('teacher-class-selector');
        this.elements.studentRows = document.getElementById('student-rows');
        this.elements.classTotal = document.getElementById('class-total');
        this.elements.classAvg = document.getElementById('class-avg');
        this.elements.classImproved = document.getElementById('class-improved');
        this.elements.problemRanking = document.getElementById('problem-ranking');
        this.elements.breakHistory = document.getElementById('break-history');
        this.elements.toast = document.getElementById('toast');
        this.elements.demoNotice = document.getElementById('demo-notice');
        this.elements.resultCount = document.getElementById('result-count');
        this.elements.mainProblem = document.getElementById('main-problem');
        this.elements.metricTempo = document.getElementById('metric-tempo');
        this.elements.metricStability = document.getElementById('metric-stability');
        this.elements.metricJump = document.getElementById('metric-jump');
        this.elements.metricArm = document.getElementById('metric-arm');
        this.elements.metricFatigue = document.getElementById('metric-fatigue');
        this.elements.metricBreaks = document.getElementById('metric-breaks');
        this.elements.prescriptionTitle = document.getElementById('prescription-title');
        this.elements.prescriptionDesc = document.getElementById('prescription-desc');
        this.elements.prescriptionDetail = document.getElementById('prescription-detail');
        this.elements.trainingCountdown = document.getElementById('training-countdown');
        this.elements.trainingInstruction = document.getElementById('training-instruction');
        this.elements.trainingProgressFill = document.getElementById('training-progress-fill');
        this.elements.trainingProgressText = document.getElementById('training-progress-text');
    }

    bindEvents() {
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', () => this.switchMode(btn.dataset.mode));
        });

        this.elements.classSelector.addEventListener('change', () => this.validateStudentInput());
        this.elements.studentName.addEventListener('input', () => this.validateStudentInput());
        this.elements.startTestBtn.addEventListener('click', () => this.startTest());
        this.elements.stopTestBtn.addEventListener('click', () => this.stopTest());

        document.getElementById('train-btn')?.addEventListener('click', () => this.startTraining());
        document.getElementById('retest-btn')?.addEventListener('click', () => this.resetToTest());
        document.getElementById('view-report-btn')?.addEventListener('click', () => this.showReport());
        document.getElementById('finish-training-btn')?.addEventListener('click', () => this.finishTraining());

        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', () => this.switchTeacherTab(btn.dataset.tab));
        });

        this.elements.teacherClassSelector?.addEventListener('change', () => this.renderTeacherDashboard());
    }

    checkCameraSupport() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            this.showToast('您的浏览器不支持摄像头，将使用演示模式');
            this.demoMode = true;
            this.elements.demoNotice?.classList.remove('hidden');
        }
    }

    switchMode(mode) {
        this.currentMode = mode;
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });
        document.getElementById('student-mode').classList.toggle('active', mode === 'student');
        document.getElementById('teacher-mode').classList.toggle('active', mode === 'teacher');
        if (mode === 'teacher') this.renderTeacherDashboard();
    }

    switchTeacherTab(tab) {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `tab-${tab}`);
        });
        switch (tab) {
            case 'overview': this.renderStudentList(); break;
            case 'ranking': this.renderProblemRanking(); break;
            case 'review': this.renderBreakHistory(); break;
            case 'groups': this.renderTrainingGroups(); break;
        }
    }

    validateStudentInput() {
        const classSelected = this.elements.classSelector.value;
        const nameEntered = this.elements.studentName.value.trim();
        this.elements.startTestBtn.disabled = !classSelected || !nameEntered;
    }

    async startTest() {
        this.currentClass = this.elements.classSelector.value;
        this.currentStudent = this.elements.studentName.value.trim();

        this.elements.classSelect.classList.add('hidden');
        this.elements.testArea.classList.remove('hidden');

        if (this.demoMode) {
            this.startDemoTest();
        } else {
            await this.startRealTest();
        }
    }

    async startRealTest() {
        if (!this.analyzer) {
            this.analyzer = new JumpRopeAnalyzer();
            await this.analyzer.init();
            this.analyzer.onCountUpdate = (count) => {
                this.elements.liveCount.textContent = count;
            };
            this.analyzer.onComplete = (metrics) => this.handleTestComplete(metrics);
            this.analyzer.onError = (error) => {
                this.showToast(error);
                this.resetToTest();
            };
        }

        const cameraReady = await this.analyzer.startCamera(
            this.elements.cameraPreview,
            this.elements.poseCanvas
        );

        if (!cameraReady) {
            this.showToast('摄像头启动失败，切换演示模式');
            this.demoMode = true;
            this.elements.demoNotice?.classList.remove('hidden');
            this.startDemoTest();
            return;
        }

        this.startCountdown();
    }

    startDemoTest() {
        let count = 3;
        this.elements.countdownOverlay.classList.remove('hidden');
        this.elements.countdownNumber.textContent = count;

        const countdownInterval = setInterval(() => {
            count--;
            if (count > 0) {
                this.elements.countdownNumber.textContent = count;
            } else {
                clearInterval(countdownInterval);
                this.elements.countdownOverlay.classList.add('hidden');
                this.elements.stopTestBtn.classList.remove('hidden');
                this.runDemoTest();
            }
        }, 1000);
    }

    runDemoTest() {
        let elapsed = 0;
        const duration = 30000;
        let count = 0;
        const baseTempo = 150 + Math.random() * 30;

        this.demoInterval = setInterval(() => {
            elapsed += 100;
            const remaining = Math.max(0, Math.ceil((duration - elapsed) / 1000));
            if (this.elements.testTimerDisplay) {
                this.elements.testTimerDisplay.textContent = remaining;
            }

            if (Math.random() < 0.1) {
                count++;
                this.elements.liveCount.textContent = count;
            }

            const tempo = baseTempo + Math.sin(elapsed / 2000) * 10;
            this.elements.liveTempo.textContent = Math.round(tempo);

            if (elapsed >= duration) {
                clearInterval(this.demoInterval);
                this.handleTestComplete(this.generateDemoMetrics(count));
            }
        }, 100);
    }

    generateDemoMetrics(count) {
        return {
            count: count || Math.floor(Math.random() * 30) + 50,
            avgTempo: ((count || 60) * 2).toFixed(1),
            tempoStability: 0.6 + Math.random() * 0.3,
            jumpHeight: 0.08 + Math.random() * 0.12,
            armSpread: 0.15 + Math.random() * 0.2,
            wristDrive: 0.4 + Math.random() * 0.3,
            fatigueDrop: 0.1 + Math.random() * 0.2,
            breakCount: Math.floor(Math.random() * 3)
        };
    }

    startCountdown() {
        let count = 3;
        this.elements.countdownOverlay.classList.remove('hidden');
        this.elements.countdownNumber.textContent = count;

        const countdownInterval = setInterval(() => {
            count--;
            if (count > 0) {
                this.elements.countdownNumber.textContent = count;
            } else {
                clearInterval(countdownInterval);
                this.elements.countdownOverlay.classList.add('hidden');
                this.elements.stopTestBtn.classList.remove('hidden');
                this.analyzer.start();
                this.startLiveUpdate();
            }
        }, 1000);
    }

    startLiveUpdate() {
        const updateInterval = setInterval(() => {
            if (!this.analyzer || !this.analyzer.isRunning) {
                clearInterval(updateInterval);
                return;
            }
            const live = this.analyzer.getLiveData();
            this.elements.liveCount.textContent = live.count;
            this.elements.liveTempo.textContent = live.tempo || '--';
        }, 100);
    }

    stopTest() {
        if (this.demoMode) {
            if (this.demoInterval) {
                clearInterval(this.demoInterval);
            }
            const count = parseInt(this.elements.liveCount.textContent) || 0;
            this.handleTestComplete(this.generateDemoMetrics(count));
        } else if (this.analyzer) {
            const metrics = this.analyzer.calculateMetrics();
            this.analyzer.stop();
            this.handleTestComplete(metrics);
        }
    }

    handleTestComplete(metrics) {
        const diagnosis = diagnose(metrics);
        this.lastResult = { metrics, diagnosis };

        this.elements.resultCount.textContent = metrics.count;
        this.elements.mainProblem.textContent = diagnosis.diagnosis;
        this.updateMetricsDisplay(metrics);
        this.updatePrescription(diagnosis.prescriptionCode);

        this.elements.testArea.classList.add('hidden');
        this.elements.stopTestBtn.classList.add('hidden');
        this.elements.diagnosisResult.classList.remove('hidden');

        this.showToast('诊断完成！');
    }

    updateMetricsDisplay(metrics) {
        this.elements.metricTempo.textContent = formatMetricValue('avgTempo', metrics.avgTempo);
        this.elements.metricTempo.className = 'metric-value';

        this.elements.metricStability.textContent = formatMetricValue('tempoStability', metrics.tempoStability);
        this.elements.metricStability.className = `metric-value ${getMetricRating('tempoStability', metrics.tempoStability)}`;

        this.elements.metricJump.textContent = formatMetricValue('jumpHeight', metrics.jumpHeight);
        this.elements.metricJump.className = `metric-value ${getMetricRating('jumpHeight', metrics.jumpHeight)}`;

        this.elements.metricArm.textContent = formatMetricValue('armSpread', metrics.armSpread);
        this.elements.metricArm.className = `metric-value ${getMetricRating('armSpread', metrics.armSpread)}`;

        this.elements.metricFatigue.textContent = formatMetricValue('fatigueDrop', metrics.fatigueDrop);
        this.elements.metricFatigue.className = `metric-value ${getMetricRating('fatigueDrop', metrics.fatigueDrop)}`;

        this.elements.metricBreaks.textContent = metrics.breakCount.toString();
        this.elements.metricBreaks.className = `metric-value ${metrics.breakCount > 0 ? 'warning' : 'good'}`;
    }

    updatePrescription(prescriptionCode) {
        const content = getPrescriptionContent(prescriptionCode);
        const card = document.getElementById('prescription-card');
        card.querySelector('.prescription-icon').textContent = content.icon;
        this.elements.prescriptionTitle.textContent = content.title;
        this.elements.prescriptionDesc.textContent = content.description;
        this.elements.prescriptionDetail.textContent = content.detail;

        const instruction = this.elements.trainingInstruction;
        instruction.querySelector('h3').textContent = content.title;
        instruction.querySelector('p').textContent = content.description;
    }

    startTraining() {
        this.elements.diagnosisResult.classList.add('hidden');
        this.elements.trainingArea.classList.remove('hidden');
        this.trainingRemaining = 180;
        this.updateTrainingDisplay();

        this.trainingTimer = setInterval(() => {
            this.trainingRemaining--;
            this.updateTrainingDisplay();
            if (this.trainingRemaining <= 0) this.finishTraining();
        }, 1000);
    }

    updateTrainingDisplay() {
        const minutes = Math.floor(this.trainingRemaining / 60);
        const seconds = this.trainingRemaining % 60;
        this.elements.trainingCountdown.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

        const progress = ((180 - this.trainingRemaining) / 180) * 100;
        this.elements.trainingProgressFill.style.width = `${progress}%`;
        this.elements.trainingProgressText.textContent = `${Math.round(progress)}%`;
    }

    finishTraining() {
        if (this.trainingTimer) {
            clearInterval(this.trainingTimer);
            this.trainingTimer = null;
        }
        this.showToast('训练完成！准备再次测试');
        setTimeout(() => this.resetToTest(), 1500);
    }

    resetToTest() {
        this.elements.trainingArea.classList.add('hidden');
        this.elements.diagnosisResult.classList.add('hidden');
        this.elements.testArea.classList.add('hidden');
        this.elements.classSelect.classList.remove('hidden');
        this.elements.liveCount.textContent = '0';
        this.elements.liveTempo.textContent = '--';
        if (this.analyzer) this.analyzer.stop();
    }

    showReport() {
        this.showToast('完整报告功能开发中');
    }

    renderTeacherDashboard() {
        const classStudents = DEMO_DATA.students.filter(s => s.class === 'class1');
        this.elements.classTotal.textContent = classStudents.length;
        const avg = Math.round(classStudents.reduce((sum, s) => sum + s.count, 0) / classStudents.length);
        this.elements.classAvg.textContent = avg;
        const improved = classStudents.filter(s => s.improvement > 0).length;
        this.elements.classImproved.textContent = improved;
        this.renderStudentList();
        this.renderProblemRanking();
        this.renderBreakHistory();
        this.renderTrainingGroups();
    }

    renderStudentList() {
        const classStudents = DEMO_DATA.students.filter(s => s.class === 'class1');
        this.elements.studentRows.innerHTML = classStudents.map(student => {
            const problemTag = getProblemName(student.mainProblem);
            const prescription = getPrescription(student.mainProblem);
            const tagClass = student.improvement > 10 ? 'good' : student.improvement > 0 ? 'warning' : '';
            return `
                <div class="student-row">
                    <span>${student.name}</span>
                    <span>${student.count}</span>
                    <span><span class="problem-tag ${tagClass}">${problemTag}</span></span>
                    <span>${prescription.title}</span>
                </div>
            `;
        }).join('');
    }

    renderProblemRanking() {
        const classStudents = DEMO_DATA.students.filter(s => s.class === 'class1');
        const problemCounts = { arm_spread: 0, jump_high: 0, rhythm_unstable: 0, fatigue_drop: 0, wrist_weak: 0 };
        classStudents.forEach(s => {
            if (problemCounts.hasOwnProperty(s.mainProblem)) problemCounts[s.mainProblem]++;
        });

        const maxCount = Math.max(...Object.values(problemCounts), 1);
        const colors = { arm_spread: '#FF6B6B', jump_high: '#4ECDC4', rhythm_unstable: '#FFE66D', fatigue_drop: '#95E1D3', wrist_weak: '#DDA0DD' };

        this.elements.problemRanking.innerHTML = Object.entries(problemCounts)
            .filter(([_, count]) => count > 0)
            .sort((a, b) => b[1] - a[1])
            .map(([problem, count]) => `
                <div class="ranking-item">
                    <div class="ranking-label">
                        <span>${getProblemName(problem)}</span>
                        <span>${count}人</span>
                    </div>
                    <div class="ranking-bar">
                        <div class="ranking-bar-fill" style="width:${(count/maxCount)*100}%;background:${colors[problem]}"></div>
                    </div>
                </div>
            `).join('');
    }

    renderBreakHistory() {
        if (DEMO_DATA.breaks.length === 0) {
            this.elements.breakHistory.innerHTML = '<p class="empty-state">暂无断绳记录</p>';
            return;
        }
        this.elements.breakHistory.innerHTML = DEMO_DATA.breaks.map(brk => `
            <div style="padding:12px;border-bottom:1px solid var(--border)">
                <div style="display:flex;justify-content:space-between;margin-bottom:4px">
                    <strong>${brk.student}</strong>
                    <span style="color:var(--text-light)">${brk.time}</span>
                </div>
                <div style="font-size:13px;color:var(--text-light)">断绳原因: ${brk.reason}</div>
            </div>
        `).join('');
    }

    renderTrainingGroups() {
        const classStudents = DEMO_DATA.students.filter(s => s.class === 'class1');
        const groups = {
            'rhythm_unstable': { members: [], element: 'group-a-members' },
            'arm_spread': { members: [], element: 'group-b-members' },
            'jump_high': { members: [], element: 'group-c-members' },
            'fatigue_drop': { members: [], element: 'group-d-members' }
        };

        classStudents.forEach(s => {
            if (groups.hasOwnProperty(s.mainProblem)) groups[s.mainProblem].members.push(s.name);
        });

        Object.entries(groups).forEach(([_, data]) => {
            const membersEl = document.getElementById(data.element);
            const countEl = membersEl.parentElement.querySelector('.group-count');
            countEl.textContent = `${data.members.length}人`;
            membersEl.textContent = data.members.length > 0 ? data.members.join('、') : '暂无成员';
        });
    }

    showToast(message) {
        this.elements.toast.textContent = message;
        this.elements.toast.classList.remove('hidden');
        setTimeout(() => this.elements.toast.classList.add('hidden'), 2500);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new JumpRopeCoachApp();
});
