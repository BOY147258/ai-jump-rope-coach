/**
 * AI提分教练 - 主应用
 * 赛博朋克科技风格
 */

class JumpRopeCoachApp {
    constructor() {
        this.analyzer = null;
        this.currentView = 'calibration';
        this.demoMode = false;
        this.demoInterval = null;
        this.trainingTimer = null;
        this.trainingRemaining = 180;
        this.calibrationInterval = null;
        this.lastResult = null;
        this.elements = {};
        this.init();
    }

    init() {
        this.cacheElements();
        this.bindEvents();
        this.checkCameraSupport();
    }

    cacheElements() {
        // 视图
        this.elements.calibrationView = document.getElementById('calibration-view');
        this.elements.countdownView = document.getElementById('countdown-view');
        this.elements.testingView = document.getElementById('testing-view');
        this.elements.resultView = document.getElementById('result-view');
        this.elements.trainingView = document.getElementById('training-view');

        // 摄像头
        this.elements.cameraPreview = document.getElementById('camera-preview');
        this.elements.poseCanvas = document.getElementById('pose-canvas');

        // 校准状态
        this.elements.startBtn = document.getElementById('start-btn');
        this.elements.positionStatus = document.getElementById('position-status');
        this.elements.distanceValue = document.getElementById('distance-value');
        this.elements.statusHeight = document.getElementById('status-height');
        this.elements.statusAlign = document.getElementById('status-align');
        this.elements.statusVisibility = document.getElementById('status-visibility');

        // 倒计时
        this.elements.countdownNumber = document.getElementById('countdown-number');

        // 测试
        this.elements.testTimerDisplay = document.getElementById('test-timer-display');
        this.elements.progressCircle = document.getElementById('progress-circle');
        this.elements.liveCount = document.getElementById('live-count');
        this.elements.liveTempo = document.getElementById('live-tempo');
        this.elements.liveCalories = document.getElementById('live-calories');
        this.elements.waveformCanvas = document.getElementById('waveform-canvas');

        // 结果
        this.elements.resultCount = document.getElementById('result-count');
        this.elements.resultGrade = document.getElementById('result-grade');
        this.elements.mainProblem = document.getElementById('main-problem');
        this.elements.metricTempo = document.getElementById('metric-tempo');
        this.elements.metricStability = document.getElementById('metric-stability');
        this.elements.metricJump = document.getElementById('metric-jump');
        this.elements.metricArm = document.getElementById('metric-arm');
        this.elements.metricFatigue = document.getElementById('metric-fatigue');
        this.elements.prescriptionIcon = document.getElementById('prescription-icon');
        this.elements.prescriptionTitle = document.getElementById('prescription-title');
        this.elements.prescriptionDesc = document.getElementById('prescription-desc');
        this.elements.prescriptionDetail = document.getElementById('prescription-detail');

        // 训练
        this.elements.trainingTimer = document.getElementById('training-timer');
        this.elements.exerciseIcon = document.getElementById('exercise-icon');
        this.elements.exerciseTitle = document.getElementById('exercise-title');
        this.elements.exerciseDesc = document.getElementById('exercise-desc');
        this.elements.trainingProgressFill = document.getElementById('training-progress-fill');
        this.elements.trainingProgressText = document.getElementById('training-progress-text');

        // 按钮
        this.elements.trainBtn = document.getElementById('train-btn');
        this.elements.retestBtn = document.getElementById('retest-btn');
        this.elements.skipTrainingBtn = document.getElementById('skip-training-btn');
        this.elements.teacherModeBtn = document.getElementById('teacher-mode-btn');
        this.elements.closeTeacherBtn = document.getElementById('close-teacher-btn');
        this.elements.teacherPanel = document.getElementById('teacher-panel');

        // Toast
        this.elements.toast = document.getElementById('toast');
        this.elements.demoNotice = document.getElementById('demo-notice');
    }

    bindEvents() {
        this.elements.startBtn.addEventListener('click', () => this.startTest());
        this.elements.trainBtn.addEventListener('click', () => this.startTraining());
        this.elements.retestBtn.addEventListener('click', () => this.resetToCalibration());
        this.elements.skipTrainingBtn.addEventListener('click', () => this.finishTraining());
        this.elements.teacherModeBtn.addEventListener('click', () => this.showTeacherPanel());
        this.elements.closeTeacherBtn.addEventListener('click', () => this.hideTeacherPanel());
    }

    checkCameraSupport() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            this.showToast('浏览器不支持摄像头，将使用演示模式');
            this.demoMode = true;
            this.elements.demoNotice.classList.remove('hidden');
        }
        this.initCamera();
    }

    async initCamera() {
        if (!this.analyzer) {
            this.analyzer = new JumpRopeAnalyzer();
            await this.analyzer.init();

            this.analyzer.onCalibrationUpdate = (data) => this.updateCalibrationUI(data);
            this.analyzer.onCountUpdate = (count) => {
                this.elements.liveCount.textContent = count;
                this.updateCalories(count);
            };
            this.analyzer.onMetricsUpdate = (data) => this.updateLiveMetrics(data);
            this.analyzer.onComplete = (metrics) => this.showResults(metrics);
            this.analyzer.onError = (error) => {
                this.showToast(error);
                this.demoMode = true;
                this.elements.demoNotice.classList.remove('hidden');
            };
        }

        if (this.demoMode) {
            // 演示模式：模拟校准通过
            this.elements.startBtn.disabled = false;
            this.elements.positionStatus.textContent = '演示模式';
            this.elements.positionStatus.classList.add('ready');
            this.elements.distanceValue.textContent = '2.5';
            this.elements.statusHeight.classList.add('ready');
            this.elements.statusHeight.querySelector('.status-value').textContent = 'OK';
            this.elements.statusAlign.classList.add('ready');
            this.elements.statusAlign.querySelector('.status-value').textContent = 'OK';
            this.elements.statusVisibility.classList.add('ready');
            this.elements.statusVisibility.querySelector('.status-value').textContent = 'OK';
        } else {
            const success = await this.analyzer.startCamera(
                this.elements.cameraPreview,
                this.elements.poseCanvas
            );

            if (success) {
                this.analyzer.startCalibration();
                this.startCalibrationMonitor();
            } else {
                this.demoMode = true;
                this.elements.demoNotice.classList.remove('hidden');
                this.elements.startBtn.disabled = false;
            }
        }
    }

    startCalibrationMonitor() {
        this.calibrationInterval = setInterval(() => {
            if (this.analyzer.calibrationData) {
                const data = this.analyzer.calibrationData;
                if (data.isCalibrated) {
                    this.elements.startBtn.disabled = false;
                }
            }
        }, 100);
    }

    updateCalibrationUI(data) {
        // 位置状态
        if (data.isCalibrated) {
            this.elements.positionStatus.textContent = '✓ 位置正确';
            this.elements.positionStatus.classList.add('ready');
            this.elements.startBtn.disabled = false;
        } else if (data.visibility > 0.5) {
            if (!data.isCentered) {
                this.elements.positionStatus.textContent = '↔ 请居中站';
            } else if (!data.isGoodDistance) {
                this.elements.positionStatus.textContent = '↕ 请调整距离';
            } else {
                this.elements.positionStatus.textContent = '⏳ 等待稳定...';
            }
            this.elements.positionStatus.classList.remove('ready');
            this.elements.startBtn.disabled = true;
        } else {
            this.elements.positionStatus.textContent = '👤 未检测到人体';
            this.elements.positionStatus.classList.remove('ready');
            this.elements.startBtn.disabled = true;
        }

        // 距离显示（估算）
        if (data.personScale > 0) {
            const distance = (0.5 / data.personScale * 3).toFixed(1);
            this.elements.distanceValue.textContent = Math.min(9.9, Math.max(0.5, distance));
        }

        // 身高检测
        if (data.isGoodDistance) {
            this.elements.statusHeight.classList.add('ready');
            this.elements.statusHeight.querySelector('.status-value').textContent = 'OK';
        } else {
            this.elements.statusHeight.classList.remove('ready');
            this.elements.statusHeight.querySelector('.status-value').textContent = data.personScale > 0.3 ? '近' : '远';
        }

        // 居中程度
        if (data.isCentered) {
            this.elements.statusAlign.classList.add('ready');
            this.elements.statusAlign.querySelector('.status-value').textContent = 'OK';
        } else {
            this.elements.statusAlign.classList.remove('ready');
            this.elements.statusAlign.querySelector('.status-value').textContent = data.offsetX < 0.25 ? '偏' : '偏离';
        }

        // 骨骼识别
        const visPercent = Math.round(data.visibility * 100);
        if (visPercent > 80) {
            this.elements.statusVisibility.classList.add('ready');
            this.elements.statusVisibility.querySelector('.status-value').textContent = 'OK';
        } else {
            this.elements.statusVisibility.classList.remove('ready');
            this.elements.statusVisibility.querySelector('.status-value').textContent = visPercent + '%';
        }
    }

    switchView(viewName) {
        const views = ['calibration', 'countdown', 'testing', 'result', 'training'];
        views.forEach(v => {
            const el = this.elements[v + 'View'];
            if (el) {
                el.classList.toggle('hidden', v !== viewName);
                el.classList.toggle('active', v === viewName);
            }
        });
        this.currentView = viewName;
    }

    startTest() {
        if (this.calibrationInterval) {
            clearInterval(this.calibrationInterval);
        }

        this.switchView('countdown');
        this.analyzer.stopCalibration();

        let count = 3;
        this.elements.countdownNumber.textContent = count;

        const countdownInterval = setInterval(() => {
            count--;
            if (count > 0) {
                this.elements.countdownNumber.textContent = count;
            } else {
                clearInterval(countdownInterval);
                this.startRealTest();
            }
        }, 1000);
    }

    startRealTest() {
        if (this.demoMode) {
            this.runDemoTest();
        } else {
            this.switchView('testing');
            this.analyzer.start();
            this.startTestMonitor();
        }
    }

    runDemoTest() {
        this.switchView('testing');

        let elapsed = 0;
        const duration = 30000;
        let count = 0;
        const baseTempo = 150 + Math.random() * 30;
        const caloriesPerJump = 0.1;

        this.demoInterval = setInterval(() => {
            elapsed += 100;
            const remaining = Math.max(0, Math.ceil((duration - elapsed) / 1000));
            this.elements.testTimerDisplay.textContent = remaining;

            // 更新进度环
            const progress = (elapsed / duration) * 100;
            const dashOffset = 283 - (283 * progress / 100);
            this.elements.progressCircle.style.strokeDashoffset = dashOffset;

            // 随机增加次数
            if (Math.random() < 0.12) {
                count++;
                this.elements.liveCount.textContent = count;
                this.updateCalories(count * caloriesPerJump);
            }

            // 更新节奏
            const tempo = baseTempo + Math.sin(elapsed / 2000) * 10;
            this.elements.liveTempo.textContent = Math.round(tempo);

            // 更新波形
            this.drawWaveform(Math.sin(elapsed / 100) * 30 + Math.random() * 10);

            if (elapsed >= duration) {
                clearInterval(this.demoInterval);
                this.showResults(this.generateDemoMetrics(count));
            }
        }, 100);
    }

    startTestMonitor() {
        const updateInterval = setInterval(() => {
            if (!this.analyzer.isRunning) {
                clearInterval(updateInterval);
                return;
            }

            const elapsed = Date.now() - this.analyzer.startTime;
            const remaining = Math.max(0, Math.ceil((this.duration - elapsed) / 1000));
            this.elements.testTimerDisplay.textContent = remaining;

            // 更新进度环
            const progress = (elapsed / this.analyzer.duration) * 100;
            const dashOffset = 283 - (283 * progress / 100);
            this.elements.progressCircle.style.strokeDashoffset = dashOffset;

            const live = this.analyzer.getLiveData();
            this.elements.liveTempo.textContent = live.tempo || '--';
            this.drawWaveform(Math.sin(elapsed / 100) * 30 + Math.random() * 10);
        }, 100);
    }

    get duration() {
        return 30000;
    }

    updateCalories(calories) {
        this.elements.liveCalories.textContent = Math.round(calories);
    }

    updateLiveMetrics(data) {
        // 实时更新（如果需要）
    }

    drawWaveform(value) {
        const canvas = this.elements.waveformCanvas;
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        ctx.clearRect(0, 0, width, height);

        // 绘制波形
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 2;
        ctx.beginPath();

        for (let x = 0; x < width; x++) {
            const y = height / 2 + Math.sin((x + Date.now() / 50) / 10) * 20 + value * Math.sin(x / 20);
            if (x === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();

        // 绘制中线
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.3)';
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
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

    showResults(metrics) {
        this.lastResult = metrics;

        // 计算等级
        const grade = this.calculateGrade(metrics.count);

        this.elements.resultCount.textContent = metrics.count;
        this.elements.resultGrade.textContent = grade;

        // 诊断
        const diagnosis = diagnose(metrics);
        this.elements.mainProblem.textContent = diagnosis.diagnosis;

        // 更新指标
        this.updateMetricsDisplay(metrics);
        this.updatePrescription(diagnosis.prescriptionCode);

        this.switchView('result');
    }

    calculateGrade(count) {
        if (count >= 100) return 'S';
        if (count >= 85) return 'A';
        if (count >= 70) return 'B';
        if (count >= 55) return 'C';
        if (count >= 40) return 'D';
        return 'E';
    }

    updateMetricsDisplay(metrics) {
        // 平均节奏
        this.elements.metricTempo.textContent = formatMetricValue('avgTempo', metrics.avgTempo);
        this.elements.metricTempo.parentElement.querySelector('.metric-fill').style.width =
            Math.min(100, metrics.avgTempo / 3) + '%';

        // 节奏稳定
        const stabilityPercent = Math.round(metrics.tempoStability * 100);
        this.elements.metricStability.textContent = stabilityPercent + '%';
        this.elements.metricStability.parentElement.querySelector('.metric-fill').style.width =
            stabilityPercent + '%';

        // 起跳高度（越低越好）
        const jumpPercent = 100 - Math.round(metrics.jumpHeight * 500);
        this.elements.metricJump.textContent = jumpPercent + '%';
        this.elements.metricJump.parentElement.querySelector('.metric-fill').style.width =
            jumpPercent + '%';

        // 手臂外展（越低越好）
        const armPercent = 100 - Math.round(metrics.armSpread * 300);
        this.elements.metricArm.textContent = armPercent + '%';
        this.elements.metricArm.parentElement.querySelector('.metric-fill').style.width =
            armPercent + '%';

        // 后半段掉速（越低越好）
        const fatiguePercent = 100 - Math.round(metrics.fatigueDrop * 200);
        this.elements.metricFatigue.textContent = fatiguePercent + '%';
        this.elements.metricFatigue.parentElement.querySelector('.metric-fill').style.width =
            fatiguePercent + '%';
    }

    updatePrescription(code) {
        const content = getPrescriptionContent(code);

        this.elements.prescriptionIcon.textContent = content.icon;
        this.elements.prescriptionTitle.textContent = content.title;
        this.elements.prescriptionDesc.textContent = content.description;
        this.elements.prescriptionDetail.textContent = content.detail;

        // 训练页面
        this.elements.exerciseIcon.textContent = content.icon;
        this.elements.exerciseTitle.textContent = content.title;
        this.elements.exerciseDesc.textContent = content.description;
    }

    startTraining() {
        this.switchView('training');
        this.trainingRemaining = 180;
        this.updateTrainingDisplay();

        this.trainingTimer = setInterval(() => {
            this.trainingRemaining--;
            this.updateTrainingDisplay();

            if (this.trainingRemaining <= 0) {
                this.finishTraining();
            }
        }, 1000);
    }

    updateTrainingDisplay() {
        const minutes = Math.floor(this.trainingRemaining / 60);
        const seconds = this.trainingRemaining % 60;
        this.elements.trainingTimer.textContent =
            `${minutes}:${seconds.toString().padStart(2, '0')}`;

        const progress = ((180 - this.trainingRemaining) / 180) * 100;
        this.elements.trainingProgressFill.style.width = `${progress}%`;
        this.elements.trainingProgressText.textContent = `${Math.round(progress)}%`;
    }

    finishTraining() {
        if (this.trainingTimer) {
            clearInterval(this.trainingTimer);
            this.trainingTimer = null;
        }

        this.showToast('训练完成！');
        setTimeout(() => this.resetToCalibration(), 1500);
    }

    resetToCalibration() {
        if (this.trainingTimer) {
            clearInterval(this.trainingTimer);
            this.trainingTimer = null;
        }

        this.elements.liveCount.textContent = '0';
        this.elements.liveTempo.textContent = '--';
        this.elements.liveCalories.textContent = '0';
        this.elements.progressCircle.style.strokeDashoffset = 283;

        this.switchView('calibration');

        if (this.analyzer) {
            this.analyzer.stop();
            this.analyzer.startCalibration();
            this.startCalibrationMonitor();
        }
    }

    showTeacherPanel() {
        this.elements.teacherPanel.classList.remove('hidden');
    }

    hideTeacherPanel() {
        this.elements.teacherPanel.classList.add('hidden');
    }

    showToast(message) {
        this.elements.toast.textContent = message;
        this.elements.toast.classList.remove('hidden');

        setTimeout(() => {
            this.elements.toast.classList.add('hidden');
        }, 2500);
    }
}

// 启动应用
document.addEventListener('DOMContentLoaded', () => {
    window.app = new JumpRopeCoachApp();
});
