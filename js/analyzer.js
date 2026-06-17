/**
 * 跳绳分析器 v4.0
 * 实时骨架镜像 + 动作反馈
 */

class JumpRopeAnalyzer {
    constructor() {
        this.isRunning = false;
        this.startTime = 0;
        this.duration = 60000;
        this.pose = null;
        this.camera = null;

        this.jumpCount = 0;
        this.breakCount = 0;

        this.timestamps = [];
        this.jumpHeights = [];
        this.leftWristTrajectory = [];
        this.rightWristTrajectory = [];
        this.hipHeights = [];
        this.shoulderWidths = [];

        this.lastJumpTime = 0;
        this.jumpInterval = [];
        this.inAir = false;
        this.airThreshold = 0.015;
        this.groundLevel = null;

        this.potentialBreaks = [];

        // 实时指标
        this.currentProblem = null;
        this.problemHint = '';
        this.lastProblemChange = 0;
        this.recentProblems = [];

        // 回调
        this.onPersonDetected = null;
        this.onReadyDetected = null;
        this.onCountUpdate = null;
        this.onMetricsUpdate = null;
        this.onComplete = null;
        this.onError = null;
        this.onLandmarksUpdate = null; // 新增：骨架数据回调
    }

    async init() {
        this.pose = new Pose({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
        });

        this.pose.setOptions({
            modelComplexity: 1,
            smoothLandmarks: true,
            enableSegmentation: false,
            smoothSegmentation: false
        });

        this.pose.onResults((results) => this.onPoseResults(results));
        return this;
    }

    async startCamera(videoElement, canvasElement) {
        try {
            this.camera = new Camera(videoElement, {
                onFrame: async () => {
                    if (this.pose) {
                        await this.pose.send({ image: videoElement });
                    }
                },
                width: 640,
                height: 480
            });

            await this.camera.start();
            this.canvasElement = canvasElement;
            return true;
        } catch (error) {
            console.error('摄像头启动失败:', error);
            if (this.onError) this.onError('无法访问摄像头');
            return false;
        }
    }

    setDuration(seconds) {
        this.duration = seconds * 1000;
    }

    start() {
        this.isRunning = true;
        this.startTime = Date.now();
        this.jumpCount = 0;
        this.breakCount = 0;
        this.jumpInterval = [];
        this.lastJumpTime = 0;
        this.inAir = false;
        this.groundLevel = null;
        this.timestamps = [];
        this.jumpHeights = [];
        this.leftWristTrajectory = [];
        this.rightWristTrajectory = [];
        this.hipHeights = [];
        this.shoulderWidths = [];
        this.potentialBreaks = [];
        this.recentProblems = [];
        this.currentProblem = null;
    }

    stop() {
        this.isRunning = false;
    }

    onPoseResults(results) {
        if (!this.canvasElement) return;

        // 绘制姿态（用于检测页面）
        this.drawPose(results);

        // 检测模式
        if (!this.isRunning && results.poseLandmarks) {
            const data = this.analyzeForDetection(results.poseLandmarks);
            if (data.personDetected && this.onPersonDetected) {
                this.onPersonDetected(data);
            }
            if (data.readyDetected && this.onReadyDetected) {
                this.onReadyDetected();
            }
        }

        // 测试模式
        if (this.isRunning && results.poseLandmarks) {
            const elapsed = Date.now() - this.startTime;

            this.processLandmarks(results.poseLandmarks, elapsed);

            // 实时反馈
            const liveFeedback = this.getLiveFeedback();

            if (this.onMetricsUpdate) {
                this.onMetricsUpdate({
                    count: this.jumpCount,
                    ...liveFeedback
                });
            }

            if (this.onLandmarksUpdate) {
                this.onLandmarksUpdate(results.poseLandmarks, results.image.width, results.image.height);
            }

            if (elapsed >= this.duration) {
                this.stop();
                if (this.onComplete) {
                    this.onComplete(this.calculateMetrics());
                }
            }
        }
    }

    /**
     * 获取实时反馈
     */
    getLiveFeedback() {
        const feedback = {
            problem: this.currentProblem,
            hint: this.problemHint,
            isGood: true,
            currentJumpHeight: 0,
            currentArmSpread: 0,
            currentRhythm: 0
        };

        // 计算最近10次跳跃的平均指标
        if (this.jumpHeights.length > 0) {
            const recent = this.jumpHeights.slice(-10);
            feedback.currentJumpHeight = recent.reduce((a, b) => a + b, 0) / recent.length;
        }

        if (this.shoulderWidths.length > 0) {
            const recent = this.shoulderWidths.slice(-10);
            feedback.currentArmSpread = recent.reduce((a, b) => a + b, 0) / recent.length;
        }

        if (this.jumpInterval.length > 0) {
            const recent = this.jumpInterval.slice(-5);
            const avgInterval = recent.reduce((a, b) => a + b, 0) / recent.length;
            feedback.currentRhythm = 60000 / avgInterval;
        }

        return feedback;
    }

    /**
     * 分析准备状态
     */
    analyzeForDetection(landmarks) {
        const keyPoints = this.getVisibleKeyPoints(landmarks);
        const visibility = keyPoints.length / 17;
        const personDetected = visibility > 0.6;

        let readyDetected = false;
        if (personDetected) {
            const leftShoulder = landmarks[11];
            const rightShoulder = landmarks[12];
            const leftElbow = landmarks[13];
            const rightElbow = landmarks[14];
            const leftWrist = landmarks[15];
            const rightWrist = landmarks[16];

            const leftArmUp = leftWrist.y < leftShoulder.y - 0.05;
            const rightArmUp = rightWrist.y < rightShoulder.y - 0.05;
            const armsRaised = leftArmUp && rightArmUp;

            const leftHip = landmarks[23];
            const rightHip = landmarks[24];
            const torsoUpright = Math.abs(leftShoulder.y - leftHip.y) > 0.25;

            readyDetected = armsRaised && torsoUpright;
        }

        return {
            personDetected,
            readyDetected,
            visibility: Math.round(visibility * 100),
            keyPointsCount: keyPoints.length
        };
    }

    getVisibleKeyPoints(landmarks) {
        return landmarks.filter(p => p.visibility > 0.5);
    }

    /**
     * 绘制姿态
     */
    drawPose(results) {
        if (!this.canvasElement) return;

        const ctx = this.canvasElement.getContext('2d');
        this.canvasElement.width = results.image.width || 640;
        this.canvasElement.height = results.image.height || 480;

        ctx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);

        if (results.poseLandmarks) {
            this.drawConnections(ctx, results.poseLandmarks, false);
            this.drawLandmarks(ctx, results.poseLandmarks, false);
        }
    }

    /**
     * 绘制镜像骨架（测试中）
     */
    drawMirrorPose(landmarks, width, height) {
        if (!this.mirrorCanvas) return;

        const ctx = this.mirrorCanvas.getContext('2d');
        ctx.clearRect(0, 0, width, height);

        this.drawConnections(ctx, landmarks, true);
        this.drawLandmarks(ctx, landmarks, true);
    }

    drawConnections(ctx, landmarks, isMirror) {
        const connections = [
            // 躯干
            { from: 11, to: 12, color: '#00f0ff', width: 4 }, // 肩膀
            { from: 11, to: 23, color: '#ff00aa', width: 3 }, // 左肩到左髋
            { from: 12, to: 24, color: '#ff00aa', width: 3 }, // 右肩到右髋
            { from: 23, to: 24, color: '#ff00aa', width: 3 }, // 髋部

            // 左臂
            { from: 11, to: 13, color: '#00ff88', width: 3 }, // 左肩到左肘
            { from: 13, to: 15, color: '#00ff88', width: 3 }, // 左肘到左腕

            // 右臂
            { from: 12, to: 14, color: '#00ff88', width: 3 },
            { from: 14, to: 16, color: '#00ff88', width: 3 },

            // 左腿
            { from: 23, to: 25, color: '#ffaa00', width: 3 },
            { from: 25, to: 27, color: '#ffaa00', width: 3 },

            // 右腿
            { from: 24, to: 26, color: '#ffaa00', width: 3 },
            { from: 26, to: 28, color: '#ffaa00', width: 3 }
        ];

        connections.forEach(conn => {
            const s = landmarks[conn.from], e = landmarks[conn.to];
            if (s && e && s.visibility > 0.5 && e.visibility > 0.5) {
                // 发光效果
                ctx.shadowColor = conn.color;
                ctx.shadowBlur = 10;

                ctx.strokeStyle = conn.color;
                ctx.lineWidth = conn.width;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(s.x * width, s.y * height);
                ctx.lineTo(e.x * width, e.y * height);
                ctx.stroke();

                ctx.shadowBlur = 0;
            }
        });
    }

    drawLandmarks(ctx, landmarks, isMirror) {
        const colors = {
            // 肩膀
            11: '#00f0ff', 12: '#00f0ff',
            // 手腕（重点关注）
            15: '#ff4466', 16: '#ff4466',
            // 脚踝（跳跃检测）
            27: '#00ff88', 28: '#00ff88',
            // 其他
            13: '#00ff88', 14: '#00ff88',
            23: '#ff00aa', 24: '#ff00aa',
            25: '#ffaa00', 26: '#ffaa00'
        };

        Object.entries(colors).forEach(([idx, color]) => {
            const point = landmarks[idx];
            if (point && point.visibility > 0.5) {
                const x = point.x * width;
                const y = point.y * height;
                const radius = (idx == 15 || idx == 16 || idx == 27 || idx == 28) ? 8 : 6;

                // 发光
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

                ctx.shadowBlur = 0;
            }
        });
    }

    processLandmarks(landmarks, timestamp) {
        const leftAnkle = landmarks[27];
        const rightAnkle = landmarks[28];
        const leftHip = landmarks[23];
        const rightHip = landmarks[24];
        const leftWrist = landmarks[15];
        const rightWrist = landmarks[16];
        const leftShoulder = landmarks[11];
        const rightShoulder = landmarks[12];

        this.timestamps.push(timestamp);

        // 跳跃检测
        if (leftAnkle.visibility > 0.5 && rightAnkle.visibility > 0.5) {
            const ankleHeight = (leftAnkle.y + rightAnkle.y) / 2;
            this.jumpHeights.push(ankleHeight);
            this.detectJump(ankleHeight, timestamp);
        }

        // 髋部高度
        if (leftHip.visibility > 0.5 && rightHip.visibility > 0.5) {
            this.hipHeights.push((leftHip.y + rightHip.y) / 2);
        }

        // 手臂外展检测
        if (leftWrist.visibility > 0.5 && rightWrist.visibility > 0.5 && leftShoulder.visibility > 0.5 && rightShoulder.visibility > 0.5) {
            // 计算手腕相对于肩膀的横向距离
            const shoulderWidth = Math.abs(rightShoulder.x - leftShoulder.x);
            const leftWristDist = Math.abs(leftWrist.x - leftShoulder.x);
            const rightWristDist = Math.abs(rightWrist.x - rightShoulder.x);
            const armSpreadRatio = (leftWristDist + rightWristDist) / shoulderWidth;

            this.shoulderWidths.push(armSpreadRatio);
            this.leftWristTrajectory.push(leftWrist.x - leftShoulder.x);
            this.rightWristTrajectory.push(rightShoulder.x - rightWrist.x);

            // 检测实时问题
            this.analyzeCurrentProblem(armSpreadRatio, ankleHeight);
        }
    }

    /**
     * 分析当前问题并生成提示
     */
    analyzeCurrentProblem(armSpread, ankleHeight) {
        const now = Date.now();
        const problems = [];

        // 手臂外展检测
        if (armSpread > 1.8) {
            problems.push({ type: 'arm_spread', severity: Math.min(1, (armSpread - 1.8) / 0.5) });
        } else if (armSpread < 1.3) {
            problems.push({ type: 'arm_good', severity: 1 });
        }

        // 起跳高度检测
        if (this.jumpHeights.length > 5) {
            const recent = this.jumpHeights.slice(-10);
            const avgHeight = recent.reduce((a, b) => a + b, 0) / recent.length;
            const jumpRange = Math.max(...recent) - Math.min(...recent);

            if (jumpRange > 0.08) {
                problems.push({ type: 'jump_high', severity: Math.min(1, (jumpRange - 0.08) / 0.05) });
            } else {
                problems.push({ type: 'jump_good', severity: 1 });
            }
        }

        // 节奏稳定性检测
        if (this.jumpInterval.length > 5) {
            const recent = this.jumpInterval.slice(-5);
            const avg = recent.reduce((a, b) => a + b, 0) / recent.length;
            const variance = Math.sqrt(recent.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / recent.length);
            const cv = variance / avg;

            if (cv > 0.2) {
                problems.push({ type: 'rhythm_bad', severity: Math.min(1, (cv - 0.2) / 0.3) });
            }
        }

        // 更新问题
        this.recentProblems = problems;

        // 确定当前主要问题
        const mainProblem = problems.find(p => p.type !== 'arm_good' && p.type !== 'jump_good' && p.type !== 'rhythm_bad');

        if (mainProblem && (!this.currentProblem || this.currentProblem.type !== mainProblem.type)) {
            this.currentProblem = mainProblem;
            this.updateProblemHint(mainProblem);
        } else if (!mainProblem && problems.some(p => p.type === 'arm_good' || p.type === 'jump_good')) {
            this.currentProblem = { type: 'good', hint: '动作标准！保持！' };
            this.problemHint = '动作标准！保持！';
        }
    }

    updateProblemHint(problem) {
        const hints = {
            'arm_spread': '手臂稍开，收紧肘部',
            'jump_high': '起跳过高，脚尖轻点',
            'rhythm_bad': '节奏不稳，注意均匀'
        };

        this.problemHint = hints[problem.type] || '继续加油';
    }

    detectJump(ankleHeight, timestamp) {
        if (this.groundLevel === null) {
            this.groundLevel = ankleHeight;
        }

        const heightDiff = this.groundLevel - ankleHeight;

        if (!this.inAir && heightDiff > this.airThreshold) {
            this.inAir = true;
            this.lastJumpTime = timestamp;
        } else if (this.inAir && heightDiff < this.airThreshold / 2) {
            this.inAir = false;

            if (this.lastJumpTime > 0) {
                const interval = timestamp - this.lastJumpTime;
                if (interval > 100 && interval < 1500) {
                    this.jumpInterval.push(interval);
                }
            }

            this.jumpCount++;
            if (this.onCountUpdate) {
                this.onCountUpdate(this.jumpCount);
            }
        }
    }

    calculateMetrics() {
        const metrics = {
            count: this.jumpCount,
            avgTempo: 0,
            tempoStability: 0,
            jumpHeight: 0,
            armSpread: 0,
            wristDrive: 0,
            fatigueDrop: 0,
            breakCount: this.breakCount
        };

        if (this.jumpInterval.length > 0) {
            const avgInterval = this.jumpInterval.reduce((a, b) => a + b, 0) / this.jumpInterval.length;
            metrics.avgTempo = (60000 / avgInterval).toFixed(1);
        }

        if (this.jumpInterval.length > 2) {
            const mean = this.jumpInterval.reduce((a, b) => a + b, 0) / this.jumpInterval.length;
            const variance = Math.sqrt(this.jumpInterval.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / this.jumpInterval.length);
            const cv = variance / mean;
            metrics.tempoStability = Math.max(0, Math.min(1, 1 - cv));
        }

        if (this.jumpHeights.length > 0 && this.groundLevel !== null) {
            const maxHeight = Math.max(...this.jumpHeights.map(h => this.groundLevel - h));
            metrics.jumpHeight = Math.min(maxHeight, 0.3);
        }

        if (this.shoulderWidths.length > 0) {
            metrics.armSpread = this.shoulderWidths.slice(-30).reduce((a, b) => a + b, 0) / Math.min(30, this.shoulderWidths.length);
        }

        if (this.jumpInterval.length > 10) {
            const half = Math.floor(this.jumpInterval.length / 2);
            const first = this.jumpInterval.slice(0, half).reduce((a, b) => a + b, 0) / half;
            const second = this.jumpInterval.slice(half).reduce((a, b) => a + b, 0) / (this.jumpInterval.length - half);
            metrics.fatigueDrop = Math.max(0, (second - first) / first);
        }

        return metrics;
    }

    getLiveData() {
        return {
            count: this.jumpCount,
            tempo: this.jumpInterval.length > 0
                ? Math.round(60000 / (this.jumpInterval.slice(-5).reduce((a, b) => a + b, 0) / 5))
                : 0,
            inAir: this.inAir,
            elapsed: this.isRunning ? Date.now() - this.startTime : 0,
            problem: this.currentProblem,
            hint: this.problemHint
        };
    }
}

window.JumpRopeAnalyzer = JumpRopeAnalyzer;
