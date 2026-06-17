/**
 * 跳绳分析器 v3.0
 * 简化版：检测人体 → 识别准备 → 自动开始
 */

class JumpRopeAnalyzer {
    constructor() {
        this.isRunning = false;
        this.startTime = 0;
        this.duration = 60000; // 默认60秒
        this.pose = null;
        this.camera = null;

        this.jumpCount = 0;
        this.breakCount = 0;

        this.timestamps = [];
        this.jumpHeights = [];
        this.leftWristTrajectory = [];
        this.rightWristTrajectory = [];
        this.hipHeights = [];

        this.lastJumpTime = 0;
        this.jumpInterval = [];
        this.inAir = false;
        this.airThreshold = 0.02;
        this.groundLevel = null;

        this.potentialBreaks = [];

        // 回调
        this.onPersonDetected = null;
        this.onReadyDetected = null;
        this.onCountUpdate = null;
        this.onMetricsUpdate = null;
        this.onComplete = null;
        this.onError = null;
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

    /**
     * 开始测试
     */
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
        this.potentialBreaks = [];
    }

    stop() {
        this.isRunning = false;
    }

    onPoseResults(results) {
        if (!this.canvasElement) return;

        // 始终绘制姿态
        this.drawPose(results);

        // 检测模式（测试未开始）
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

            if (this.onMetricsUpdate) {
                this.onMetricsUpdate(this.getLiveData());
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
     * 分析是否检测到人体和准备状态
     */
    analyzeForDetection(landmarks) {
        const keyPoints = this.getVisibleKeyPoints(landmarks);
        const visibility = keyPoints.length / 17;

        // 检测人体
        const personDetected = visibility > 0.6;

        // 检测准备状态：躯干直立，手臂抬起
        let readyDetected = false;
        if (personDetected) {
            const leftShoulder = landmarks[11];
            const rightShoulder = landmarks[12];
            const leftElbow = landmarks[13];
            const rightElbow = landmarks[14];
            const leftWrist = landmarks[15];
            const rightWrist = landmarks[16];

            // 手臂抬起检测（手腕高于肩膀）
            const leftArmUp = leftWrist.y < leftShoulder.y - 0.05;
            const rightArmUp = rightWrist.y < rightShoulder.y - 0.05;
            const armsRaised = leftArmUp && rightArmUp;

            // 躯干直立检测
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
     * 绘制姿态 - 赛博朋克风格
     */
    drawPose(results) {
        if (!this.canvasElement) return;

        const ctx = this.canvasElement.getContext('2d');
        this.canvasElement.width = results.image.width || 640;
        this.canvasElement.height = results.image.height || 480;

        ctx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);

        if (results.poseLandmarks) {
            // 发光效果
            this.drawGlow(ctx, results.poseLandmarks);
            // 连接线
            this.drawConnections(ctx, results.poseLandmarks);
            // 关键点
            this.drawLandmarks(ctx, results.poseLandmarks);
        }
    }

    drawGlow(ctx, landmarks) {
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 15;

        [11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28].forEach(idx => {
            const point = landmarks[idx];
            if (point && point.visibility > 0.5) {
                ctx.fillStyle = 'rgba(0, 240, 255, 0.2)';
                ctx.beginPath();
                ctx.arc(point.x * this.canvasElement.width, point.y * this.canvasElement.height, 12, 0, Math.PI * 2);
                ctx.fill();
            }
        });
        ctx.shadowBlur = 0;
    }

    drawConnections(ctx, landmarks) {
        const connections = [
            [11, 12, '#00f0ff'],
            [11, 13, '#00ff88'], [12, 14, '#00ff88'],
            [13, 15, '#00ff88'], [14, 16, '#00ff88'],
            [11, 23, '#ff00aa'], [12, 24, '#ff00aa'],
            [23, 24, '#ff00aa'],
            [23, 25, '#ffaa00'], [24, 26, '#ffaa00'],
            [25, 27, '#ffaa00'], [26, 28, '#ffaa00']
        ];

        connections.forEach(([start, end, color]) => {
            const s = landmarks[start], e = landmarks[end];
            if (s && e && s.visibility > 0.5 && e.visibility > 0.5) {
                ctx.strokeStyle = color;
                ctx.lineWidth = 3;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(s.x * this.canvasElement.width, s.y * this.canvasElement.height);
                ctx.lineTo(e.x * this.canvasElement.width, e.y * this.canvasElement.height);
                ctx.stroke();
            }
        });
    }

    drawLandmarks(ctx, landmarks) {
        const colors = {
            11: '#00f0ff', 12: '#00f0ff',
            13: '#00ff88', 14: '#00ff88', 15: '#00ff88', 16: '#00ff88',
            23: '#ff00aa', 24: '#ff00aa',
            25: '#ffaa00', 26: '#ffaa00', 27: '#ffaa00', 28: '#ffaa00'
        };

        Object.entries(colors).forEach(([idx, color]) => {
            const point = landmarks[idx];
            if (point && point.visibility > 0.5) {
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(point.x * this.canvasElement.width, point.y * this.canvasElement.height, 5, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.arc(point.x * this.canvasElement.width, point.y * this.canvasElement.height, 2, 0, Math.PI * 2);
                ctx.fill();
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

            if (this.groundLevel === null) {
                this.groundLevel = ankleHeight;
            }

            this.detectJump(ankleHeight, timestamp);
        }

        // 髋部高度
        if (leftHip.visibility > 0.5 && rightHip.visibility > 0.5) {
            this.hipHeights.push((leftHip.y + rightHip.y) / 2);
        }

        // 手腕轨迹
        if (leftWrist.visibility > 0.5 && rightWrist.visibility > 0.5 && leftShoulder.visibility > 0.5 && rightShoulder.visibility > 0.5) {
            this.leftWristTrajectory.push(leftWrist.x - leftShoulder.x);
            this.rightWristTrajectory.push(rightShoulder.x - rightWrist.x);
        }

        this.detectBreak(leftWrist, rightWrist, timestamp);
    }

    detectJump(ankleHeight, timestamp) {
        const heightDiff = ankleHeight - this.groundLevel;

        if (!this.inAir && heightDiff < -this.airThreshold) {
            this.inAir = true;
            this.lastJumpTime = timestamp;
        } else if (this.inAir && heightDiff > -this.airThreshold / 2) {
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

    detectBreak(leftWrist, rightWrist, timestamp) {
        if (this.leftWristTrajectory.length > 5) {
            const recent = this.leftWristTrajectory.slice(-5);
            const variance = this.calculateVariance(recent);

            if (variance > 0.05) {
                this.potentialBreaks.push({ time: timestamp, type: 'wrist_deviation' });
                this.breakCount++;
            }
        }
    }

    calculateVariance(arr) {
        if (arr.length < 2) return 0;
        const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
        return arr.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / arr.length;
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

        // 平均节奏
        if (this.jumpInterval.length > 0) {
            const avgInterval = this.jumpInterval.reduce((a, b) => a + b, 0) / this.jumpInterval.length;
            metrics.avgTempo = (60000 / avgInterval).toFixed(1);
        } else {
            metrics.avgTempo = this.jumpCount > 0 ? (this.jumpCount / (this.duration / 60000) * 2).toFixed(1) : 0;
        }

        // 节奏稳定性
        if (this.jumpInterval.length > 2) {
            const mean = this.jumpInterval.reduce((a, b) => a + b, 0) / this.jumpInterval.length;
            const cv = Math.sqrt(this.calculateVariance(this.jumpInterval)) / mean;
            metrics.tempoStability = Math.max(0, Math.min(1, 1 - cv));
        }

        // 起跳高度
        if (this.jumpHeights.length > 0 && this.groundLevel !== null) {
            const maxHeight = Math.max(...this.jumpHeights.map(h => this.groundLevel - h));
            metrics.jumpHeight = Math.min(maxHeight, 0.3);
        }

        // 手臂外展
        if (this.leftWristTrajectory.length > 0 && this.rightWristTrajectory.length > 0) {
            const avgSpread = [...this.leftWristTrajectory.slice(-30), ...this.rightWristTrajectory.slice(-30)]
                .reduce((a, b) => a + b, 0) / 60;
            metrics.armSpread = Math.abs(avgSpread);
        }

        // 手腕驱动
        if (this.leftWristTrajectory.length > 10) {
            const variance = this.calculateVariance(this.leftWristTrajectory.slice(-10));
            metrics.wristDrive = Math.max(0, 1 - variance * 10);
        }

        // 后半段掉速
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
            elapsed: this.isRunning ? Date.now() - this.startTime : 0
        };
    }
}

window.JumpRopeAnalyzer = JumpRopeAnalyzer;
