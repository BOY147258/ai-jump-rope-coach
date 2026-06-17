/**
 * AI提分教练 - 主应用 v2.0
 * 包含历史记录、语音提示、进步曲线
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
        this.lastCount = null;
        this.elements = {};
        this.settings = {};
        this.init();
    }

    init() {
        // 加载设置
        this.settings = Storage.getSettings();

        this.cacheElements();
        this.bindEvents();
        this.checkCameraSupport();
        this.initVoice();
        this.updateQuickStats();
    }

    cacheElements() {
        // 视图
        this.elements.calibrationView = document.getElementById('calibration-view');
        this.elements.countdownView = document.getElementById('countdown-view');
        this.elements.testingView = document.getElementById('testing-view');
        this.elements.resultView = document.getElementById('result-view');
        this.elements.trainingView = document.getElementById('training-view');
        this.elements.historyView = document.getElementById('history-view');
        this.elements.settingsView = document.getElementById('settings-view');

        // 按钮
        this.elements.historyBtn = document.getElementById('history-btn');
        this.elements.settingsBtn = document.getElementById('settings-btn');
        this.elements.startBtn = document.getElementById('start-btn');
        this.elements.trainBtn = document.getElementById('train-btn');
        this.elements.retestBtn = document.getElementById('retest-btn');
        this.elements.skipTrainingBtn = document.getElementById('skip-training-btn');
        this.elements.teacherModeBtn = document.getElementById('teacher-mode-btn');
        this.elements.closeTeacherBtn = document.getElementById('close-teacher-btn');
        this.elements.shareBtn = document.getElementById('share-btn');
        this.elements.clearHistoryBtn = document.getElementById('clear-history-btn');
        this.elements.backFromHistoryBtn = document.getElementById('back-from-history');
        this.elements.backFromSettingsBtn = document.getElementById('back-from-settings');

        // 摄像头
        this.elements.cameraPreview = document.getElementById('camera-preview');
        this.elements.poseCanvas = document.getElementById('pose-canvas');

        // 校准
        this.elements.positionStatus = document.getElementById('position-status');
        this.elements.distanceValue = document.getElementById('distance-value');
        this.elements.statusHeight = document.getElementById('status-height');
        this.elements.statusAlign = document.getElementById('status-align');
        this.elements.statusVisibility = document.getElementById('status-visibility');

        // 快捷统计
        this.elements.statBest = document.getElementById('stat-best');
        this.elements.statImprove = document.getElementById('stat-improve');
        this.elements.statToday = document.getElementById('stat-today');

        // 倒计时
        this.elements.countdownNumber = document.getElementById('countdown-number');

        // 测试
        this.elements.testTimerDisplay = document.getElementById('test-timer-display');
        this.elements.progressCircle = document.getElementById('progress-circle');
        this.elements.liveCount = document.getElementById('live-count');
        this.elements.liveTempo = document.getElementById('live-tempo');
        this.elements.liveCalories = document.getElementById('live-calories');
        this.elements.waveformCanvas = document.getElementById('waveform-canvas');
        this.elements.voiceIndicator = document.getElementById('voice-indicator');
        this.elements.voiceText = document.getElementById('voice-text');

        // 结果
        this.elements.improvementBanner = document.getElementById('improvement-banner');
        this.elements.improveText = document.getElementById('improve-text');
        this.elements.resultCount = document.getElementById('result-count');
        this.elements.resultGrade = document.getElementById('result-grade');
        this.elements.mainProblem = document.getElementById('main-problem');
        this.elements.metricTempo = document.getElementById('metric-tempo');
        this.elements.metricStability = document.getElementById('metric-stability');
        this.elements.metricJump = document.getElementById('metric-jump');
        this.elements.metricArm = document.getElementById('metric-arm');
        this.elements.metricFatigue = document.getElementById('metric-fatigue');
        this.elements.barTempo = document.getElementById('bar-tempo');
        this.elements.barStability = document.getElementById('bar-stability');
        this.elements.barJump = document.getElementById('bar-jump');
        this.elements.barArm = document.getElementById('bar-arm');
        this.elements.barFatigue = document.getElementById('bar-fatigue');
        this.elements.prescriptionIcon = document.getElementById('prescription-icon');
        this.elements.prescriptionTitle = document.getElementById('prescription-title');
        this.elements.prescriptionDesc = document.getElementById('prescription-desc');
        this.elements.prescriptionDetail = document.getElementById('prescription-detail');
        this.elements.chartCanvas = document.getElementById('chart-canvas');

        // 训练
        this.elements.trainingTimer = document.getElementById('training-timer');
        this.elements.exerciseIcon = document.getElementById('exercise-icon');
        this.elements.exerciseTitle = document.getElementById('exercise-title');
        this.elements.exerciseDesc = document.getElementById('exercise-desc');
        this.elements.trainingProgressFill = document.getElementById('training-progress-fill');
        this.elements.trainingProgressText = document.getElementById('training-progress-text');
        this.elements.trainingTips = document.getElementById('training-tips');

        // 教师端
        this.elements.teacherPanel = document.getElementById('teacher-panel');
        this.elements.teacherToday = document.getElementById('teacher-today');
        this.elements.teacherAvg = document.getElementById('teacher-avg');
        this.elements.teacherBest = document.getElementById('teacher-best');
        this.elements.problemBars = document.getElementById('problem-bars');
        this.elements.groupList = document.getElementById('group-list');

        // 历史
        this.elements.historyTotal = document.getElementById('history-total');
        this.elements.historyBest = document.getElementById('history-best');
        this.elements.historyAvg = document.getElementById('history-avg');
        this.elements.historyRecords = document.getElementById('history-records');
        this.elements.historyChartCanvas = document.getElementById('history-chart-canvas');

        // 设置
        this.elements.voiceToggle = document.getElementById('voice-toggle');
        this.elements.durationSelect = document.getElementById('duration-select');

        // 其他
        this.elements.toast = document.getElementById('toast');
        this.elements.demoNotice = document.getElementById('demo-notice');
    }

    bindEvents() {
        // 顶部按钮
        this.elements.historyBtn?.addEventListener('click', () => this.showHistory());
        this.elements.settingsBtn?.addEventListener('click', () => this.showSettings());

        // 主流程
        this.elements.startBtn?.addEventListener('click', () => this.startTest());
        this.elements.trainBtn?.addEventListener('click', () => this.startTraining());
        this.elements.retestBtn?.addEventListener('click', () => this.resetToCalibration());
        this.elements.skipTrainingBtn?.addEventListener('click', () => this.finishTraining());
        this.elements.shareBtn?.addEventListener('click', () => this.shareResult());

        // 教师端
        this.elements.teacherModeBtn?.addEventListener('click', () => this.showTeacherPanel());
        this.elements.closeTeacherBtn?.addEventListener('click', () => this.hideTeacherPanel());

        // 历史
        this.elements.clearHistoryBtn?.addEventListener('click', () => this.clearHistory());
        this.elements.backFromHistoryBtn?.addEventListener('click', () => this.hideHistory());

        // 设置
        this.elements.backFromSettingsBtn?.addEventListener('click', () => this.hideSettings());
        this.elements.voiceToggle?.addEventListener('change', (e) => this.toggleVoice(e.target.checked));
        this.elements.durationSelect?.addEventListener('change', (e) => this.changeDuration(e.target.value));
    }

    initVoice() {
        Voice.init();
        Voice.enabled = this.settings.voiceEnabled;
        if (this.elements.voiceToggle) {
            this.elements.voiceToggle.checked = this.settings.voiceEnabled;
        }
        if (this.elements.durationSelect) {
            this.elements.durationSelect.value = this.settings.testDuration || 30;
        }
    }

    toggleVoice(enabled) {
        this.settings.voiceEnabled = enabled;
        Voice.enabled = enabled;
        Storage.saveSettings(this.settings);
    }

    changeDuration(value) {
        this.settings.testDuration = parseInt(value);
        Storage.saveSettings(this.settings);
    }

    checkCameraSupport() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            this.showToast('浏览器不支持摄像头，将使用演示模式');
            this.demoMode = true;
            this.elements.demoNotice?.classList.remove('hidden');
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
                this.elements.demoNotice?.classList.remove('hidden');
            };
        }

        if (this.demoMode) {
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
                this.elements.demoNotice?.classList.remove('hidden');
                this.elements.startBtn.disabled = false;
            }
        }
    }

    startCalibrationMonitor() {
        this.calibrationInterval = setInterval(() => {
            if (this.analyzer.calibrationData?.isCalibrated) {
                this.elements.startBtn.disabled = false;
            }
        }, 100);
    }

    updateCalibrationUI(data) {
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

        if (data.personScale > 0) {
            const distance = (0.5 / data.personScale * 3).toFixed(1);
            this.elements.distanceValue.textContent = Math.min(9.9, Math.max(0.5, distance));
        }

        this.elements.statusHeight.classList.toggle('ready', data.isGoodDistance);
        this.elements.statusHeight.querySelector('.status-value').textContent =
            data.isGoodDistance ? 'OK' : (data.personScale > 0.3 ? '近' : '远');

        this.elements.statusAlign.classList.toggle('ready', data.isCentered);
        this.elements.statusAlign.querySelector('.status-value').textContent =
            data.isCentered ? 'OK' : (data.offsetX < 0.25 ? '偏' : '偏离');

        const visPercent = Math.round(data.visibility * 100);
        this.elements.statusVisibility.classList.toggle('ready', visPercent > 80);
        this.elements.statusVisibility.querySelector('.status-value').textContent = visPercent + '%';
    }

    updateQuickStats() {
        const stats = Storage.getStats();
        const best = Storage.getBestRecord();
        const improvement = Storage.getImprovement();

        this.elements.statBest.textContent = best ? best.count : '--';
        this.elements.statToday.textContent = stats.todayCount || '0';

        if (improvement) {
            if (improvement.isImproved) {
                this.elements.statImprove.textContent = '+' + improvement.diff;
                this.elements.statImprove.classList.add('up');
                this.elements.statImprove.classList.remove('down');
            } else if (improvement.diff < 0) {
                this.elements.statImprove.textContent = improvement.diff.toString();
                this.elements.statImprove.classList.add('down');
                this.elements.statImprove.classList.remove('up');
            } else {
                this.elements.statImprove.textContent = '0';
                this.elements.statImprove.classList.remove('up', 'down');
            }
        } else {
            this.elements.statImprove.textContent = '--';
        }
    }

    switchView(viewName) {
        const views = ['calibration', 'countdown', 'testing', 'result', 'training', 'history', 'settings'];
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
        if (this.calibrationInterval) clearInterval(this.calibrationInterval);

        // 保存上次成绩
        const history = Storage.getHistory();
        if (history.length > 0) {
            this.lastCount = history[0].count;
        }

        this.switchView('countdown');
        this.analyzer?.stopCalibration();

        let count = 3;
        this.elements.countdownNumber.textContent = count;
        Voice.countdown(count);

        const countdownInterval = setInterval(() => {
            count--;
            if (count > 0) {
                this.elements.countdownNumber.textContent = count;
                Voice.countdown(count);
            } else {
                clearInterval(countdownInterval);
                Voice.testStart();
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
        Voice.speak('测试开始');

        let elapsed = 0;
        const duration = (this.settings.testDuration || 30) * 1000;
        let count = 0;
        const baseTempo = 150 + Math.random() * 30;
        const caloriesPerJump = 0.1;

        this.demoInterval = setInterval(() => {
            elapsed += 100;
            const remaining = Math.max(0, Math.ceil((duration - elapsed) / 1000));
            this.elements.testTimerDisplay.textContent = remaining;

            const progress = (elapsed / duration) * 100;
            const dashOffset = 283 - (283 * progress / 100);
            this.elements.progressCircle.style.strokeDashoffset = dashOffset;

            if (Math.random() < 0.12) {
                count++;
                this.elements.liveCount.textContent = count;
                this.updateCalories(count * caloriesPerJump);
            }

            const tempo = baseTempo + Math.sin(elapsed / 2000) * 10;
            this.elements.liveTempo.textContent = Math.round(tempo);
            this.drawWaveform(Math.sin(elapsed / 100) * 30 + Math.random() * 10);

            // 语音时间提醒
            if (remaining === 10 || remaining === 5 || remaining === 3) {
                Voice.timeReminder(remaining);
                this.elements.voiceText.textContent = `还剩${remaining}秒`;
            }

            if (elapsed >= duration) {
                clearInterval(this.demoInterval);
                Voice.testEnd(count);
                this.elements.voiceText.textContent = '测试结束';
                this.showResults(this.generateDemoMetrics(count));
            }
        }, 100);
    }

    startTestMonitor() {
        this.elements.testTimerDisplay.textContent = this.settings.testDuration || 30;

        const updateInterval = setInterval(() => {
            if (!this.analyzer?.isRunning) {
                clearInterval(updateInterval);
                return;
            }

            const elapsed = Date.now() - this.analyzer.startTime;
            const duration = (this.settings.testDuration || 30) * 1000;
            const remaining = Math.max(0, Math.ceil((duration - elapsed) / 1000));
            this.elements.testTimerDisplay.textContent = remaining;

            const progress = (elapsed / duration) * 100;
            this.elements.progressCircle.style.strokeDashoffset = 283 - (283 * progress / 100);

            const live = this.analyzer.getLiveData();
            this.elements.liveTempo.textContent = live.tempo || '--';
            this.drawWaveform(Math.sin(elapsed / 100) * 30 + Math.random() * 10);

            if (remaining === 10 || remaining === 5 || remaining === 3) {
                Voice.timeReminder(remaining);
            }
        }, 100);
    }

    get duration() {
        return (this.settings.testDuration || 30) * 1000;
    }

    updateCalories(calories) {
        this.elements.liveCalories.textContent = Math.round(calories);
    }

    updateLiveMetrics(data) {}

    drawWaveform(value) {
        const canvas = this.elements.waveformCanvas;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        ctx.clearRect(0, 0, width, height);
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 2;
        ctx.beginPath();

        for (let x = 0; x < width; x++) {
            const y = height / 2 + Math.sin((x + Date.now() / 50) / 10) * 20 + value * Math.sin(x / 20);
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();

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
        // 保存结果
        const diagnosis = diagnose(metrics);
        const record = Storage.saveResult({
            count: metrics.count,
            metrics: metrics,
            diagnosis: diagnosis,
            prescriptionCode: diagnosis.prescriptionCode
        });

        this.lastResult = record;

        // 显示进步
        const improvement = Storage.getImprovement();
        if (improvement && this.lastCount !== null) {
            this.elements.improvementBanner.classList.remove('hidden', 'down');
            if (improvement.isImproved) {
                this.elements.improveText.textContent = `📈 进步了 +${improvement.diff} 次`;
            } else if (improvement.diff < 0) {
                this.elements.improvementBanner.classList.add('down');
                this.elements.improveText.textContent = `📉 下降了 ${Math.abs(improvement.diff)} 次`;
            } else {
                this.elements.improveText.textContent = '➡️ 和上次一样';
            }
            Voice.improvement(improvement.diff);
        } else {
            this.elements.improvementBanner.classList.add('hidden');
        }

        // 等级
        this.elements.resultCount.textContent = metrics.count;
        this.elements.resultGrade.textContent = record.grade;

        // 诊断
        this.elements.mainProblem.textContent = diagnosis.diagnosis;
        Voice.diagnosis(diagnosis.diagnosis);

        // 指标
        this.updateMetricsDisplay(metrics);
        this.updatePrescription(diagnosis.prescriptionCode);

        // 进步曲线
        this.drawProgressChart();

        // 更新快捷统计
        this.updateQuickStats();

        this.switchView('result');
    }

    updateMetricsDisplay(metrics) {
        const setBar = (el, percent) => {
            if (el) el.style.width = Math.max(0, Math.min(100, percent)) + '%';
        };

        setBar(this.elements.barTempo, Math.min(100, metrics.avgTempo / 3));
        this.elements.metricTempo.textContent = formatMetricValue('avgTempo', metrics.avgTempo);

        const stabilityPercent = Math.round(metrics.tempoStability * 100);
        setBar(this.elements.barStability, stabilityPercent);
        this.elements.metricStability.textContent = stabilityPercent + '%';

        const jumpPercent = Math.max(0, 100 - Math.round(metrics.jumpHeight * 500));
        setBar(this.elements.barJump, jumpPercent);
        this.elements.metricJump.textContent = jumpPercent + '%';

        const armPercent = Math.max(0, 100 - Math.round(metrics.armSpread * 300));
        setBar(this.elements.barArm, armPercent);
        this.elements.metricArm.textContent = armPercent + '%';

        const fatiguePercent = Math.max(0, 100 - Math.round(metrics.fatigueDrop * 200));
        setBar(this.elements.barFatigue, fatiguePercent);
        this.elements.metricFatigue.textContent = fatiguePercent + '%';
    }

    updatePrescription(code) {
        const content = getPrescriptionContent(code);

        this.elements.prescriptionIcon.textContent = content.icon;
        this.elements.prescriptionTitle.textContent = content.title;
        this.elements.prescriptionDesc.textContent = content.description;
        this.elements.prescriptionDetail.textContent = content.detail;

        this.elements.exerciseIcon.textContent = content.icon;
        this.elements.exerciseTitle.textContent = content.title;
        this.elements.exerciseDesc.textContent = content.description;

        // 更新训练提示
        const tips = this.getTrainingTips(code);
        this.elements.trainingTips.innerHTML = `<p>💡 ${tips}</p>`;
    }

    getTrainingTips(code) {
        const tips = {
            'jump_high': '专注于减少起跳高度，用前脚掌轻点地面',
            'arm_spread': '双手肘部贴近身体两侧，只用手腕转动',
            'wrist_weak': '先练无绳手腕转动，找到发力感',
            'rhythm_unstable': '跟着节拍器练习，先慢后快',
            'fatigue_drop': '控制前15秒节奏，留体力给后15秒',
            'heavy_landing': '用脚尖先着地，膝盖微屈缓冲',
            'break_frequent': '放慢速度，确保每个动作做完整',
            'comprehensive': '专注质量，不要急于求成'
        };
        return tips[code] || tips['comprehensive'];
    }

    drawProgressChart() {
        const canvas = this.elements.chartCanvas;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        const padding = 20;

        ctx.clearRect(0, 0, width, height);

        const data = Storage.getProgressData(7);
        const maxCount = Math.max(...data.filter(d => d.best).map(d => d.best), 100);

        // 绘制网格
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.1)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
            const y = padding + (height - 2 * padding) * i / 4;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.stroke();
        }

        // 绘制折线
        const points = data.map((d, i) => ({
            x: padding + (width - 2 * padding) * i / (data.length - 1),
            y: d.best ? height - padding - (d.best / maxCount) * (height - 2 * padding) : null
        }));

        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 2;
        ctx.beginPath();

        let started = false;
        points.forEach((p, i) => {
            if (p.y !== null) {
                if (!started) {
                    ctx.moveTo(p.x, p.y);
                    started = true;
                } else {
                    ctx.lineTo(p.x, p.y);
                }
            }
        });
        ctx.stroke();

        // 绘制点
        points.forEach((p) => {
            if (p.y !== null) {
                ctx.fillStyle = '#00f0ff';
                ctx.beginPath();
                ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = '#0a0a1a';
                ctx.beginPath();
                ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        });

        // 绘制日期
        ctx.fillStyle = '#8080a0';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        data.forEach((d, i) => {
            if (i % 2 === 0 || data.length <= 7) {
                ctx.fillText(d.dateStr, points[i].x, height - 5);
            }
        });
    }

    startTraining() {
        this.switchView('training');
        this.trainingRemaining = 180;
        this.updateTrainingDisplay();

        Voice.speak('开始训练');

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
        this.elements.trainingTimer.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

        const progress = ((180 - this.trainingRemaining) / 180) * 100;
        this.elements.trainingProgressFill.style.width = `${progress}%`;
        this.elements.trainingProgressText.textContent = `${Math.round(progress)}%`;
    }

    finishTraining() {
        if (this.trainingTimer) {
            clearInterval(this.trainingTimer);
            this.trainingTimer = null;
        }

        Voice.speak('训练完成');
        this.showToast('训练完成！');
        setTimeout(() => this.resetToCalibration(), 1500);
    }

    resetToCalibration() {
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

    shareResult() {
        if (!this.lastResult) return;

        const text = `AI提分教练测试结果\n` +
            `📊 成绩：${this.lastResult.count}次/30秒\n` +
            `⭐ 等级：${this.lastResult.grade}\n` +
            `💡 ${this.lastResult.diagnosis?.diagnosis || '继续加油！'}\n\n` +
            `30秒诊断，3分钟修正，7天提分`;

        if (navigator.share) {
            navigator.share({ text }).catch(() => {
                this.copyToClipboard(text);
            });
        } else {
            this.copyToClipboard(text);
        }
    }

    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.showToast('成绩已复制到剪贴板');
        }).catch(() => {
            this.showToast('复制失败');
        });
    }

    // 教师端
    showTeacherPanel() {
        this.updateTeacherStats();
        this.elements.teacherPanel.classList.remove('hidden');
    }

    hideTeacherPanel() {
        this.elements.teacherPanel.classList.add('hidden');
    }

    updateTeacherStats() {
        const stats = Storage.getStats();
        const history = Storage.getHistory();

        this.elements.teacherToday.textContent = stats.todayCount;
        this.elements.teacherAvg.textContent = stats.avg;
        this.elements.teacherBest.textContent = stats.best || '--';

        // 问题分布
        const distribution = Storage.getProblemDistribution();
        const total = Object.values(distribution).reduce((a, b) => a + b, 0) || 1;
        const colors = {
            'arm_spread': '#FF6B6B',
            'jump_high': '#4ECDC4',
            'rhythm_unstable': '#FFE66D',
            'fatigue_drop': '#95E1D3',
            'wrist_weak': '#DDA0DD'
        };
        const names = {
            'arm_spread': '手臂外展',
            'jump_high': '起跳过高',
            'rhythm_unstable': '节奏不稳',
            'fatigue_drop': '后半段掉速',
            'wrist_weak': '手腕不足'
        };

        this.elements.problemBars.innerHTML = Object.entries(distribution)
            .filter(([_, count]) => count > 0)
            .sort((a, b) => b[1] - a[1])
            .map(([problem, count]) => `
                <div class="problem-bar-item">
                    <div class="problem-bar-label">
                        <span class="problem-bar-name">${names[problem] || problem}</span>
                        <span class="problem-bar-count">${count}人</span>
                    </div>
                    <div class="problem-bar">
                        <div class="problem-bar-fill" style="width: ${(count / total) * 100}%; background: ${colors[problem] || '#00f0ff'}"></div>
                    </div>
                </div>
            `).join('') || '<p style="color: var(--text-dim)">暂无数据</p>';

        // 训练分组
        const groups = {
            'rhythm_unstable': { name: '节奏训练组', tag: 'A', class: 'a' },
            'arm_spread': { name: '夹肘训练组', tag: 'B', class: 'b' },
            'jump_high': { name: '低弹跳训练组', tag: 'C', class: 'c' },
            'fatigue_drop': { name: '耐力训练组', tag: 'D', class: 'd' }
        };

        this.elements.groupList.innerHTML = Object.entries(groups).map(([problem, group]) => {
            const count = distribution[problem] || 0;
            const members = history.filter(r => r.diagnosis?.mainProblemCode === problem).map(r => `第${Math.ceil(Math.random() * 30)}排`);
            return `
                <div class="group-item">
                    <span class="group-tag ${group.class}">${group.tag}</span>
                    <div class="group-info">
                        <div class="group-name">${group.name}</div>
                        <div class="group-count">${count}人</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // 历史记录
    showHistory() {
        this.updateHistoryDisplay();
        this.switchView('history');
    }

    hideHistory() {
        this.switchView('calibration');
    }

    updateHistoryDisplay() {
        const stats = Storage.getStats();
        const history = Storage.getHistory();

        this.elements.historyTotal.textContent = stats.total;
        this.elements.historyBest.textContent = stats.best || '--';
        this.elements.historyAvg.textContent = stats.avg;

        // 绘制历史曲线
        this.drawHistoryChart();

        // 记录列表
        this.elements.historyRecords.innerHTML = history.slice(0, 20).map((record, index) => {
            const time = new Date(record.timestamp);
            const timeStr = `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;

            let improveHtml = '';
            if (index < history.length - 1) {
                const diff = record.count - history[index + 1].count;
                if (diff > 0) {
                    improveHtml = `<span class="record-improve up">+${diff}</span>`;
                } else if (diff < 0) {
                    improveHtml = `<span class="record-improve down">${diff}</span>`;
                }
            }

            return `
                <div class="history-record">
                    <span class="record-time">${timeStr}</span>
                    <span class="record-count">${record.count}</span>
                    <span class="record-grade" style="background: ${this.getGradeColor(record.grade)}">${record.grade}</span>
                    <span class="record-problem">${getProblemName(record.diagnosis?.mainProblemCode)}</span>
                    ${improveHtml}
                </div>
            `;
        }).join('') || '<p style="color: var(--text-dim); text-align: center; padding: 20px;">暂无历史记录</p>';
    }

    drawHistoryChart() {
        const canvas = this.elements.historyChartCanvas;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        const padding = 30;

        ctx.clearRect(0, 0, width, height);

        const history = Storage.getRecentHistory(20).reverse();
        if (history.length === 0) return;

        const maxCount = Math.max(...history.map(r => r.count), 100);

        // 网格
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.1)';
        for (let i = 0; i <= 4; i++) {
            const y = padding + (height - 2 * padding) * i / 4;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.stroke();

            ctx.fillStyle = '#8080a0';
            ctx.font = '10px sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText(Math.round(maxCount * (1 - i / 4)), padding - 5, y + 3);
        }

        // 折线
        const points = history.map((r, i) => ({
            x: padding + (width - 2 * padding) * i / Math.max(history.length - 1, 1),
            y: height - padding - (r.count / maxCount) * (height - 2 * padding)
        }));

        // 填充
        ctx.fillStyle = 'rgba(0, 240, 255, 0.1)';
        ctx.beginPath();
        ctx.moveTo(points[0].x, height - padding);
        points.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.lineTo(points[points.length - 1].x, height - padding);
        ctx.closePath();
        ctx.fill();

        // 线
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        points.forEach((p, i) => {
            if (i === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
        });
        ctx.stroke();

        // 点
        points.forEach(p => {
            ctx.fillStyle = '#00f0ff';
            ctx.beginPath();
            ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    getGradeColor(grade) {
        const colors = { S: '#FFD700', A: '#00ff88', B: '#00f0ff', C: '#8080a0', D: '#ffaa00', E: '#ff4466' };
        return colors[grade] || '#8080a0';
    }

    clearHistory() {
        if (confirm('确定要清除所有历史记录吗？')) {
            Storage.clearHistory();
            this.updateHistoryDisplay();
            this.updateQuickStats();
            this.showToast('历史已清除');
        }
    }

    // 设置
    showSettings() {
        this.switchView('settings');
    }

    hideSettings() {
        this.switchView('calibration');
    }

    showToast(message) {
        this.elements.toast.textContent = message;
        this.elements.toast.classList.remove('hidden');

        setTimeout(() => {
            this.elements.toast.classList.add('hidden');
        }, 2500);
    }
}

// 启动
document.addEventListener('DOMContentLoaded', () => {
    window.app = new JumpRopeCoachApp();
});
