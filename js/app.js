/**
 * AI提分教练 - 主应用 v4.0
 * 实时骨架镜像 + 动作反馈
 */

class JumpRopeCoachApp {
    constructor() {
        this.analyzer = null;
        this.currentView = 'detect';
        this.demoMode = false;
        this.demoInterval = null;
        this.trainingTimer = null;
        this.trainingRemaining = 180;
        this.lastResult = null;
        this.lastCount = null;
        this.countdownInterval = null;
        this.elements = {};
        this.settings = {};
        this.personDetected = false;
        this.readyDetected = false;
        this.autoStartEnabled = true;
        this.lastLiveData = null;
        this.init();
    }

    init() {
        this.settings = Storage.getSettings();
        this.cacheElements();
        this.bindEvents();
        this.checkCameraSupport();
        this.initVoice();
    }

    cacheElements() {
        // 视图
        this.elements.detectView = document.getElementById('detect-view');
        this.elements.testingView = document.getElementById('testing-view');
        this.elements.resultView = document.getElementById('result-view');
        this.elements.trainingView = document.getElementById('training-view');
        this.elements.historyView = document.getElementById('history-view');
        this.elements.settingsView = document.getElementById('settings-view');

        // 检测页面
        this.elements.detectHint = document.getElementById('detect-hint');
        this.elements.statusIcon = document.getElementById('status-icon');
        this.elements.statusText = document.getElementById('status-text');
        this.elements.checkPerson = document.getElementById('check-person');
        this.elements.checkReady = document.getElementById('check-ready');
        this.elements.countdownOverlay = document.getElementById('countdown-overlay');
        this.elements.countdownNumber = document.getElementById('countdown-number');
        this.elements.hintText = document.getElementById('hint-text');
        this.elements.startBtn = document.getElementById('start-btn');

        // 按钮
        this.elements.historyBtn = document.getElementById('history-btn');
        this.elements.settingsBtn = document.getElementById('settings-btn');
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

        // 测试页面（新版镜像视图）
        this.elements.mirrorVideo = document.getElementById('mirror-video');
        this.elements.mirrorCanvas = document.getElementById('mirror-canvas');
        this.elements.testTimerMini = document.getElementById('test-timer-mini');
        this.elements.progressFillThin = document.getElementById('progress-fill-thin');
        this.elements.stopTestBtn = document.getElementById('stop-test-btn');
        this.elements.liveProblemHint = document.getElementById('live-problem-hint');
        this.elements.hintTextTest = document.getElementById('hint-text');
        this.elements.actionIndicator = document.getElementById('action-indicator');
        this.elements.bigCount = document.getElementById('big-count');
        this.elements.tempoRingFill = document.getElementById('tempo-ring-fill');
        this.elements.liveBpm = document.getElementById('live-bpm');
        this.elements.liveHeight = document.getElementById('live-height');
        this.elements.liveArm = document.getElementById('live-arm');
        this.elements.alertArm = document.getElementById('alert-arm');
        this.elements.alertHeight = document.getElementById('alert-height');
        this.elements.alertRhythm = document.getElementById('alert-rhythm');
        this.elements.zoneArm = document.getElementById('zone-arm');
        this.elements.zoneLeg = document.getElementById('zone-leg');
        this.elements.encourageText = document.getElementById('encourage-text');

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
        this.elements.step1 = document.getElementById('step-1');
        this.elements.step2 = document.getElementById('step-2');
        this.elements.step3 = document.getElementById('step-3');

        // 训练
        this.elements.trainingTimer = document.getElementById('training-timer');
        this.elements.exerciseIcon = document.getElementById('exercise-icon');
        this.elements.exerciseTitle = document.getElementById('exercise-title');
        this.elements.exerciseDesc = document.getElementById('exercise-desc');
        this.elements.trainingProgressFill = document.getElementById('training-progress-fill');
        this.elements.trainingProgressText = document.getElementById('training-progress-text');
        this.elements.trainingTip = document.getElementById('training-tip');
        this.elements.demoEmoji = document.getElementById('demo-emoji');

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
        this.elements.historyBtn?.addEventListener('click', () => this.showHistory());
        this.elements.settingsBtn?.addEventListener('click', () => this.showSettings());
        this.elements.startBtn?.addEventListener('click', () => this.startCountdown());
        this.elements.trainBtn?.addEventListener('click', () => this.startTraining());
        this.elements.retestBtn?.addEventListener('click', () => this.resetToDetect());
        this.elements.skipTrainingBtn?.addEventListener('click', () => this.finishTraining());
        this.elements.shareBtn?.addEventListener('click', () => this.shareResult());
        this.elements.teacherModeBtn?.addEventListener('click', () => this.showTeacherPanel());
        this.elements.closeTeacherBtn?.addEventListener('click', () => this.hideTeacherPanel());
        this.elements.clearHistoryBtn?.addEventListener('click', () => this.clearHistory());
        this.elements.backFromHistoryBtn?.addEventListener('click', () => this.hideHistory());
        this.elements.backFromSettingsBtn?.addEventListener('click', () => this.hideSettings());
        this.elements.voiceToggle?.addEventListener('change', (e) => this.toggleVoice(e.target.checked));
        this.elements.durationSelect?.addEventListener('change', (e) => this.changeDuration(e.target.value));
        this.elements.stopTestBtn?.addEventListener('click', () => this.stopTestEarly());
    }

    initVoice() {
        Voice.init();
        Voice.enabled = this.settings.voiceEnabled ?? true;
        if (this.elements.voiceToggle) {
            this.elements.voiceToggle.checked = Voice.enabled;
        }
        const duration = this.settings.testDuration || 60;
        if (this.elements.durationSelect) {
            this.elements.durationSelect.value = duration;
        }
        if (this.elements.testTimerMini) {
            this.elements.testTimerMini.textContent = duration;
        }
    }

    toggleVoice(enabled) {
        Voice.enabled = enabled;
        this.settings.voiceEnabled = enabled;
        Storage.saveSettings(this.settings);
    }

    changeDuration(value) {
        this.settings.testDuration = parseInt(value);
        Storage.saveSettings(this.settings);
        if (this.elements.testTimerMini) {
            this.elements.testTimerMini.textContent = value;
        }
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

            const duration = this.settings.testDuration || 60;
            this.analyzer.setDuration(duration);

            this.analyzer.onPersonDetected = (data) => this.onPersonDetected(data);
            this.analyzer.onReadyDetected = () => this.onReadyDetected();
            this.analyzer.onCountUpdate = (count) => this.updateLiveCount(count);
            this.analyzer.onMetricsUpdate = (data) => this.updateLiveMetrics(data);
            this.analyzer.onLandmarksUpdate = (landmarks, w, h) => this.drawMirrorSkeleton(landmarks, w, h);
            this.analyzer.onComplete = (metrics) => this.showResults(metrics);
            this.analyzer.onError = (error) => {
                this.showToast(error);
                this.demoMode = true;
                this.elements.demoNotice?.classList.remove('hidden');
            };
        }

        if (this.demoMode) {
            this.enableDemoMode();
        } else {
            const success = await this.analyzer.startCamera(
                this.elements.cameraPreview,
                this.elements.poseCanvas
            );

            if (!success) {
                this.demoMode = true;
                this.elements.demoNotice?.classList.remove('hidden');
                this.enableDemoMode();
            }
        }
    }

    enableDemoMode() {
        this.personDetected = true;
        this.readyDetected = true;
        this.updateDetectionUI();
        this.elements.startBtn.disabled = false;
        this.elements.startBtn.classList.add('ready');
        Voice.speak('已就绪，可以开始');
    }

    onPersonDetected(data) {
        if (!this.personDetected && data.personDetected) {
            this.personDetected = true;
            Voice.speak('第一步完成，请举起双臂');
            this.showToast('已检测到您 ✓ 请举起双臂');
        }
        this.updateDetectionUI();
    }

    onReadyDetected() {
        if (!this.readyDetected) {
            this.readyDetected = true;
            this.updateDetectionUI();
            Voice.speak('准备就绪，点击开始');
            this.showToast('准备就绪！可以开始测试了');

            if (this.autoStartEnabled) {
                setTimeout(() => this.startCountdown(), 500);
            }
        }
    }

    updateDetectionUI() {
        // 更新引导步骤
        const step1 = document.getElementById('guide-step-1');
        const step2 = document.getElementById('guide-step-2');
        const step3 = document.getElementById('guide-step-3');

        if (!step1 || !step2 || !step3) return;

        // 摄像头就绪指示
        const cameraIndicator = document.getElementById('camera-ready-indicator');

        if (this.readyDetected) {
            // 全部完成
            step1.classList.remove('active');
            step1.classList.add('completed');
            step2.classList.remove('active');
            step2.classList.add('completed');
            step3.classList.add('active');
            this.elements.startBtn.disabled = false;
            this.elements.startBtn.classList.add('ready');
            this.elements.hintText.textContent = '准备完成，点击开始测试';
            if (cameraIndicator) cameraIndicator.classList.add('active');
        } else if (this.personDetected) {
            // 步骤2：举起双臂
            step1.classList.remove('active');
            step1.classList.add('completed');
            step2.classList.add('active');
            step3.classList.remove('active');
            this.elements.startBtn.disabled = true;
            this.elements.startBtn.classList.remove('ready');
            this.elements.hintText.textContent = '请双手举起跳绳，像准备跳绳一样';
            if (cameraIndicator) cameraIndicator.classList.add('active');
        } else {
            // 步骤1：进入画面
            step1.classList.add('active');
            step1.classList.remove('completed');
            step2.classList.remove('active', 'completed');
            step3.classList.remove('active', 'completed');
            this.elements.startBtn.disabled = true;
            this.elements.startBtn.classList.remove('ready');
            this.elements.hintText.textContent = '请站到摄像头前';
            if (cameraIndicator) cameraIndicator.classList.remove('active');
        }
    }

    switchView(viewName) {
        const views = ['detect', 'testing', 'result', 'training', 'history', 'settings'];
        views.forEach(v => {
            const el = this.elements[v + 'View'];
            if (el) {
                el.classList.toggle('hidden', v !== viewName);
                el.classList.toggle('active', v === viewName);
            }
        });
        this.currentView = viewName;
    }

    startCountdown() {
        if (this.countdownInterval) clearInterval(this.countdownInterval);

        const history = Storage.getHistory();
        if (history.length > 0) {
            this.lastCount = history[0].count;
        }

        this.switchView('detect');
        this.elements.countdownOverlay.classList.remove('hidden');

        let count = 3;
        this.elements.countdownNumber.textContent = count;
        Voice.countdown(count);

        this.countdownInterval = setInterval(() => {
            count--;
            if (count > 0) {
                this.elements.countdownNumber.textContent = count;
                Voice.countdown(count);
            } else {
                clearInterval(this.countdownInterval);
                this.countdownInterval = null;
                this.elements.countdownNumber.textContent = 'GO!';
                Voice.testStart();
                setTimeout(() => {
                    this.elements.countdownOverlay.classList.add('hidden');
                    this.startRealTest();
                }, 500);
            }
        }, 1000);
    }

    startRealTest() {
        if (this.demoMode) {
            this.runDemoTest();
        } else {
            // 连接镜像视频
            if (this.elements.cameraPreview && this.elements.mirrorVideo) {
                this.elements.mirrorVideo.srcObject = this.elements.cameraPreview.srcObject;
            }
            // 设置镜像画布
            if (this.analyzer) {
                this.analyzer.mirrorCanvas = this.elements.mirrorCanvas;
            }

            this.switchView('testing');
            this.resetTestUI();
            this.analyzer.start();
            this.startTestMonitor();
        }
    }

    runDemoTest() {
        this.switchView('testing');
        this.resetTestUI();
        Voice.speak('测试开始');

        const duration = (this.settings.testDuration || 60) * 1000;
        let elapsed = 0;
        let count = 0;
        let lastJump = 0;
        const baseTempo = 150 + Math.random() * 30;

        this.demoInterval = setInterval(() => {
            elapsed += 100;
            const remaining = Math.max(0, Math.ceil((duration - elapsed) / 1000));
            this.elements.testTimerMini.textContent = remaining;

            const progress = (elapsed / duration) * 100;
            this.elements.progressFillThin.style.width = progress + '%';

            // 模拟跳绳计数
            const now = Date.now();
            if (now - lastJump > 400) {
                const tempo = baseTempo + Math.sin(elapsed / 2000) * 10;
                if (Math.random() < 0.25) {
                    count++;
                    this.updateLiveCount(count);
                    lastJump = now;
                }
            }

            // 更新实时指标
            const tempo = baseTempo + Math.sin(elapsed / 2000) * 10;
            this.elements.liveBpm.textContent = Math.round(tempo);

            // 模拟问题提示
            if (count > 5 && count % 20 === 0) {
                this.showLiveHint('手臂稍开，收紧一下');
            }

            // 语音时间提醒
            if (remaining === 10 || remaining === 5 || remaining === 3) {
                Voice.timeReminder(remaining);
            }

            // 动作指示
            if (count > lastJump + 2) {
                this.elements.actionIndicator.classList.add('down');
            } else {
                this.elements.actionIndicator.classList.remove('down');
            }

            if (elapsed >= duration) {
                clearInterval(this.demoInterval);
                Voice.testEnd(count);
                this.showResults(this.generateDemoMetrics(count));
            }
        }, 100);
    }

    resetTestUI() {
        this.elements.bigCount.textContent = '0';
        this.elements.liveBpm.textContent = '--';
        this.elements.liveHeight.textContent = '--';
        this.elements.liveArm.textContent = '--';
        this.elements.testTimerMini.textContent = this.settings.testDuration || 60;
        this.elements.progressFillThin.style.width = '0%';
        this.elements.liveProblemHint.classList.add('hidden');
        this.elements.alertArm.classList.add('hidden');
        this.elements.alertHeight.classList.add('hidden');
        this.elements.alertRhythm.classList.add('hidden');
        this.elements.zoneArm?.classList.remove('active');
        this.elements.zoneLeg?.classList.remove('active');
        this.elements.encourageText.classList.remove('show');
        // 重置节奏环
        if (this.elements.tempoRingFill) {
            this.elements.tempoRingFill.style.strokeDashoffset = 346;
            this.elements.tempoRingFill.classList.remove('warning');
        }
    }

    startTestMonitor() {
        const duration = this.settings.testDuration || 60;

        const updateInterval = setInterval(() => {
            if (!this.analyzer?.isRunning) {
                clearInterval(updateInterval);
                return;
            }

            const elapsed = Date.now() - this.analyzer.startTime;
            const remaining = Math.max(0, Math.ceil((duration * 1000 - elapsed) / 1000));
            this.elements.testTimerMini.textContent = remaining;

            const progress = (elapsed / (duration * 1000)) * 100;
            this.elements.progressFillThin.style.width = progress + '%';

            if (remaining === 10 || remaining === 5 || remaining === 3) {
                Voice.timeReminder(remaining);
            }
        }, 100);
    }

    updateLiveCount(count) {
        this.elements.bigCount.textContent = count;
        // 添加动画效果
        this.elements.bigCount.style.transform = 'scale(1.1)';
        setTimeout(() => {
            this.elements.bigCount.style.transform = 'scale(1)';
        }, 100);
    }

    updateLiveMetrics(data) {
        // 更新节奏环
        if (data.tempo && this.elements.tempoRingFill) {
            const dashOffset = 346 - (346 * Math.min(data.tempo / 200, 1));
            this.elements.tempoRingFill.style.strokeDashoffset = dashOffset;

            // 如果节奏有问题，环变橙色
            if (data.tempo > 180 || data.tempo < 120) {
                this.elements.tempoRingFill.classList.add('warning');
            } else {
                this.elements.tempoRingFill.classList.remove('warning');
            }
        }

        // 更新BPM
        if (data.tempo) {
            this.elements.liveBpm.textContent = data.tempo;
        }

        // 更新起跳高度
        if (data.jumpHeight !== undefined) {
            if (data.jumpHeight > 60) {
                this.elements.liveHeight.textContent = '过高';
                this.elements.liveHeight.className = 'live-metric-value danger';
                this.elements.zoneLeg?.classList.add('active');
            } else if (data.jumpHeight > 40) {
                this.elements.liveHeight.textContent = '适中';
                this.elements.liveHeight.className = 'live-metric-value good';
                this.elements.zoneLeg?.classList.remove('active');
            } else {
                this.elements.liveHeight.textContent = '偏低';
                this.elements.liveHeight.className = 'live-metric-value';
            }
        }

        // 更新手臂状态
        if (data.armSpread !== undefined) {
            if (data.armSpread > 60) {
                this.elements.liveArm.textContent = '外展';
                this.elements.liveArm.className = 'live-metric-value warning';
                this.elements.zoneArm?.classList.add('active');
            } else if (data.armSpread > 40) {
                this.elements.liveArm.textContent = '稍开';
                this.elements.liveArm.className = 'live-metric-value';
                this.elements.zoneArm?.classList.add('active');
            } else {
                this.elements.liveArm.textContent = '收紧';
                this.elements.liveArm.className = 'live-metric-value good';
                this.elements.zoneArm?.classList.remove('active');
            }
        }

        // 更新实时问题提示
        if (data.hint) {
            this.showLiveHint(data.hint, data.isGood);
        }

        // 更新预警
        if (data.problem) {
            if (data.problem.type === 'arm_spread') {
                this.elements.alertArm.classList.remove('hidden');
            }
            if (data.problem.type === 'jump_high') {
                this.elements.alertHeight.classList.remove('hidden');
            }
            if (data.problem.type === 'rhythm_unstable') {
                this.elements.alertRhythm.classList.remove('hidden');
            }
        }

        // 更新鼓励文字
        if (data.encourage) {
            this.elements.encourageText.textContent = data.encourage;
            this.elements.encourageText.classList.add('show');
            setTimeout(() => {
                this.elements.encourageText.classList.remove('show');
            }, 2000);
        }
    }

    showLiveHint(text, isGood = false) {
        this.elements.liveProblemHint.classList.remove('hidden', 'good');
        if (isGood) {
            this.elements.liveProblemHint.classList.add('good');
        }
        this.elements.hintTextTest.textContent = text;
    }

    drawMirrorSkeleton(landmarks, width, height) {
        if (!this.elements.mirrorCanvas) return;

        const ctx = this.elements.mirrorCanvas.getContext('2d');
        this.elements.mirrorCanvas.width = width;
        this.elements.mirrorCanvas.height = height;

        ctx.clearRect(0, 0, width, height);

        // 绘制连接线
        const connections = [
            { from: 11, to: 12, color: '#00f0ff', width: 4 },
            { from: 11, to: 23, color: '#ff00aa', width: 3 },
            { from: 12, to: 24, color: '#ff00aa', width: 3 },
            { from: 23, to: 24, color: '#ff00aa', width: 3 },
            { from: 11, to: 13, color: '#00ff88', width: 3 },
            { from: 13, to: 15, color: '#00ff88', width: 3 },
            { from: 12, to: 14, color: '#00ff88', width: 3 },
            { from: 14, to: 16, color: '#00ff88', width: 3 },
            { from: 23, to: 25, color: '#ffaa00', width: 3 },
            { from: 25, to: 27, color: '#ffaa00', width: 3 },
            { from: 24, to: 26, color: '#ffaa00', width: 3 },
            { from: 26, to: 28, color: '#ffaa00', width: 3 }
        ];

        connections.forEach(conn => {
            const s = landmarks[conn.from], e = landmarks[conn.to];
            if (s && e && s.visibility > 0.5 && e.visibility > 0.5) {
                ctx.shadowColor = conn.color;
                ctx.shadowBlur = 12;
                ctx.strokeStyle = conn.color;
                ctx.lineWidth = conn.width;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(s.x * width, s.y * height);
                ctx.lineTo(e.x * width, e.y * height);
                ctx.stroke();
            }
        });

        // 绘制关节点
        const keyPoints = {
            11: '#00f0ff', 12: '#00f0ff',
            15: '#ff4466', 16: '#ff4466',
            27: '#00ff88', 28: '#00ff88',
            13: '#00ff88', 14: '#00ff88',
            23: '#ff00aa', 24: '#ff00aa',
            25: '#ffaa00', 26: '#ffaa00'
        };

        Object.entries(keyPoints).forEach(([idx, color]) => {
            const point = landmarks[idx];
            if (point && point.visibility > 0.5) {
                const x = point.x * width;
                const y = point.y * height;
                const radius = (idx == 15 || idx == 16 || idx == 27 || idx == 28) ? 8 : 6;

                ctx.shadowColor = color;
                ctx.shadowBlur = 15;
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.arc(x, y, radius * 0.4, 0, Math.PI * 2);
                ctx.fill();
            }
        });

        ctx.shadowBlur = 0;
    }

    generateDemoMetrics(count) {
        return {
            count: count || Math.floor(Math.random() * 30) + 60,
            avgTempo: ((count || 60) * 2).toFixed(1),
            tempoStability: 0.6 + Math.random() * 0.3,
            jumpHeight: 0.08 + Math.random() * 0.12,
            armSpread: 0.15 + Math.random() * 0.2,
            wristDrive: 0.4 + Math.random() * 0.3,
            fatigueDrop: 0.1 + Math.random() * 0.2,
            breakCount: Math.floor(Math.random() * 3)
        };
    }

    stopTestEarly() {
        if (!this.analyzer?.isRunning) return;

        const metrics = this.analyzer.stop();
        if (metrics) {
            this.showResults(metrics);
        } else {
            this.showToast('数据不足，无法生成报告');
            this.resetToDetect();
        }
    }

    showResults(metrics) {
        const diagnosis = diagnose(metrics);
        const record = Storage.saveResult({
            count: metrics.count,
            metrics: metrics,
            diagnosis: diagnosis,
            prescriptionCode: diagnosis.prescriptionCode
        });

        this.lastResult = record;

        // 进步提示
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

        this.elements.resultCount.textContent = metrics.count;
        this.elements.resultGrade.textContent = record.grade;
        this.elements.mainProblem.textContent = diagnosis.diagnosis;
        Voice.diagnosis(diagnosis.diagnosis);

        this.updateMetricsDisplay(metrics);
        this.updatePrescription(diagnosis.prescriptionCode);
        this.drawProgressChart();

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
        this.elements.demoEmoji.textContent = content.icon;

        const steps = this.getTrainingSteps(code);
        this.elements.step1.textContent = steps[0];
        this.elements.step2.textContent = steps[1];
        this.elements.step3.textContent = steps[2];

        this.elements.trainingTip.textContent = '💡 ' + this.getTrainingTips(code);
    }

    getTrainingSteps(code) {
        const steps = {
            'jump_high': ['脚尖轻点地面', '身体上下幅度<5cm', '膝盖微屈缓冲'],
            'arm_spread': ['肘部贴近身体', '双手靠近中线', '保持肩部放松'],
            'wrist_weak': ['手腕快速转动', '手臂保持固定', '感受前臂发力'],
            'rhythm_unstable': ['跟随节拍', '保持均匀呼吸', '不要忽快忽慢'],
            'fatigue_drop': ['前15秒控制节奏', '留体力给后半段', '匀速冲刺'],
            'heavy_landing': ['前脚掌先着地', '膝盖微屈缓冲', '落地声音要轻'],
            'break_frequent': ['放慢速度', '确保动作完整', '先求稳再求快'],
            'comprehensive': ['专注动作质量', '跟随节拍练习', '循序渐进加速']
        };
        return steps[code] || steps['comprehensive'];
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

        ctx.strokeStyle = 'rgba(0, 240, 255, 0.1)';
        for (let i = 0; i <= 4; i++) {
            const y = padding + (height - 2 * padding) * i / 4;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.stroke();
        }

        const points = data.map((d, i) => ({
            x: padding + (width - 2 * padding) * i / (data.length - 1 || 1),
            y: d.best ? height - padding - (d.best / maxCount) * (height - 2 * padding) : null
        }));

        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 2;
        ctx.beginPath();

        let started = false;
        points.forEach((p) => {
            if (p.y !== null) {
                if (!started) { ctx.moveTo(p.x, p.y); started = true; }
                else ctx.lineTo(p.x, p.y);
            }
        });
        ctx.stroke();

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
        setTimeout(() => this.resetToDetect(), 1500);
    }

    resetToDetect() {
        this.personDetected = false;
        this.readyDetected = false;

        if (this.demoMode) {
            this.enableDemoMode();
        } else {
            this.updateDetectionUI();
        }

        this.switchView('detect');
    }

    shareResult() {
        if (!this.lastResult) return;

        const text = `AI提分教练测试结果\n` +
            `📊 成绩：${this.lastResult.count}次\n` +
            `⭐ 等级：${this.lastResult.grade}\n` +
            `💡 ${this.lastResult.diagnosis?.diagnosis || '继续加油！'}\n\n` +
            `AI提分教练 - 60秒测试 · 即时诊断`;

        if (navigator.share) {
            navigator.share({ text }).catch(() => {
                navigator.clipboard.writeText(text).then(() => this.showToast('成绩已复制'));
            });
        } else {
            navigator.clipboard.writeText(text).then(() => this.showToast('成绩已复制'));
        }
    }

    showTeacherPanel() {
        this.updateTeacherStats();
        this.elements.teacherPanel.classList.remove('hidden');
    }

    hideTeacherPanel() {
        this.elements.teacherPanel.classList.add('hidden');
    }

    updateTeacherStats() {
        const stats = Storage.getStats();

        this.elements.teacherToday.textContent = stats.todayCount;
        this.elements.teacherAvg.textContent = stats.avg;
        this.elements.teacherBest.textContent = stats.best || '--';

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

        const groups = {
            'rhythm_unstable': { name: '节奏训练组', tag: 'A', class: 'a' },
            'arm_spread': { name: '夹肘训练组', tag: 'B', class: 'b' },
            'jump_high': { name: '低弹跳训练组', tag: 'C', class: 'c' },
            'fatigue_drop': { name: '耐力训练组', tag: 'D', class: 'd' }
        };

        this.elements.groupList.innerHTML = Object.entries(groups).map(([problem, group]) => {
            const count = distribution[problem] || 0;
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

    showHistory() {
        this.updateHistoryDisplay();
        this.switchView('history');
    }

    hideHistory() {
        this.switchView('detect');
    }

    updateHistoryDisplay() {
        const stats = Storage.getStats();
        const history = Storage.getHistory();

        this.elements.historyTotal.textContent = stats.total;
        this.elements.historyBest.textContent = stats.best || '--';
        this.elements.historyAvg.textContent = stats.avg;

        this.drawHistoryChart();

        this.elements.historyRecords.innerHTML = history.slice(0, 20).map((record, index) => {
            const time = new Date(record.timestamp);
            const timeStr = `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;

            let improveHtml = '';
            if (index < history.length - 1) {
                const diff = record.count - history[index + 1].count;
                if (diff > 0) improveHtml = `<span class="record-improve up">+${diff}</span>`;
                else if (diff < 0) improveHtml = `<span class="record-improve down">${diff}</span>`;
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

        ctx.strokeStyle = 'rgba(0, 240, 255, 0.1)';
        for (let i = 0; i <= 4; i++) {
            const y = padding + (height - 2 * padding) * i / 4;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.stroke();
        }

        const points = history.map((r, i) => ({
            x: padding + (width - 2 * padding) * i / Math.max(history.length - 1, 1),
            y: height - padding - (r.count / maxCount) * (height - 2 * padding)
        }));

        ctx.fillStyle = 'rgba(0, 240, 255, 0.1)';
        ctx.beginPath();
        ctx.moveTo(points[0].x, height - padding);
        points.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.lineTo(points[points.length - 1].x, height - padding);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        points.forEach((p, i) => {
            if (i === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
        });
        ctx.stroke();

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
            this.showToast('历史已清除');
        }
    }

    showSettings() {
        this.switchView('settings');
    }

    hideSettings() {
        this.switchView('detect');
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
