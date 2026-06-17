/**
 * 跳绳分析器
 * 使用 MediaPipe Pose 提取人体关键点，分析跳绳动作
 */

class JumpRopeAnalyzer {
    constructor() {
        this.isRunning = false;
        this.startTime = 0;
        this.duration = 30000;
        this.pose = null;
        this.camera = null;

        this.landmarksBuffer = [];
        this.maxBufferSize = 300;

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
                    if (this.pose && this.isRunning) {
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
            if (this.onError) this.onError('无法访问摄像头，请检查权限设置');
            return false;
        }
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
        this.potentialBreaks = [];
    }

    stop() {
        this.isRunning = false;
    }

    onPoseResults(results) {
        if (!this.isRunning) return;

        const now = Date.now();
        const elapsed = now - this.startTime;

        this.drawPose(results);

        if (elapsed <= this.duration) {
            if (results.poseLandmarks) {
                this.processLandmarks(results.poseLandmarks, elapsed);
            }
        } else if (this.isRunning) {
            this.stop();
            if (this.onComplete) {
                this.onComplete(this.calculateMetrics());
            }
        }
    }

    drawPose(results) {
        if (!this.canvasElement) return;

        const ctx = this.canvasElement.getContext('2d');
        this.canvasElement.width = results.image.width || 640;
        this.canvasElement.height = results.image.height || 480;

        ctx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);

        if (results.poseLandmarks) {
            this.drawConnections(ctx, results.poseLandmarks);
            this.drawLandmarks(ctx, results.poseLandmarks);
        }
    }

    drawConnections(ctx, landmarks) {
        const connections = [
            [11, 12],
            [11, 13], [12, 14],
            [13, 15], [14, 16],
            [11, 23], [12, 24],
            [23, 24],
            [23, 25], [24, 26],
            [25, 27], [26, 28],
            [27, 29], [28, 30],
            [29, 31], [30, 32]
        ];

        ctx.strokeStyle = '#4F46E5';
        ctx.lineWidth = 3;

        connections.forEach(([start, end]) => {
            const startPoint = landmarks[start];
            const endPoint = landmarks[end];

            if (startPoint && endPoint && startPoint.visibility > 0.5 && endPoint.visibility > 0.5) {
                ctx.beginPath();
                ctx.moveTo(startPoint.x * this.canvasElement.width, startPoint.y * this.canvasElement.height);
                ctx.lineTo(endPoint.x * this.canvasElement.width, endPoint.y * this.canvasElement.height);
                ctx.stroke();
            }
        });
    }

    drawLandmarks(ctx, landmarks) {
        ctx.fillStyle = '#4F46E5';

        const keyPoints = [11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32];

        keyPoints.forEach((idx) => {
            const point = landmarks[idx];
            if (point && point.visibility > 0.5) {
                ctx.beginPath();
                ctx.arc(
                    point.x * this.canvasElement.width,
                    point.y * this.canvasElement.height,
                    5,
                    0,
                    2 * Math.PI
                );
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

        if (leftAnkle.visibility > 0.5 && rightAnkle.visibility > 0.5) {
            const ankleHeight = (leftAnkle.y + rightAnkle.y) / 2;
            this.jumpHeights.push(ankleHeight);

            if (this.groundLevel === null) {
                this.groundLevel = ankleHeight;
            }

            this.detectJump(ankleHeight, timestamp);
        }

        if (leftHip.visibility > 0.5 && rightHip.visibility > 0.5) {
            const hipHeight = (leftHip.y + rightHip.y) / 2;
            this.hipHeights.push({ time: timestamp, height: hipHeight });
        }

        if (leftWrist.visibility > 0.5 && rightWrist.visibility > 0.5 && leftShoulder.visibility > 0.5 && rightShoulder.visibility > 0.5) {
            const leftArmSpread = leftWrist.x - leftShoulder.x;
            const rightArmSpread = rightShoulder.x - rightWrist.x;
            this.leftWristTrajectory.push(leftArmSpread);
            this.rightWristTrajectory.push(rightArmSpread);
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
                this.potentialBreaks.push({
                    time: timestamp,
                    type: 'wrist_deviation'
                });
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

        if (this.jumpInterval.length > 0) {
            const avgInterval = this.jumpInterval.reduce((a, b) => a + b, 0) / this.jumpInterval.length;
            metrics.avgTempo = (60000 / avgInterval).toFixed(1);
        } else {
            metrics.avgTempo = this.jumpCount > 0 ? (this.jumpCount / (this.duration / 60000) * 2).toFixed(1) : 0;
        }

        if (this.jumpInterval.length > 2) {
            const mean = this.jumpInterval.reduce((a, b) => a + b, 0) / this.jumpInterval.length;
            const variance = this.calculateVariance(this.jumpInterval);
            const cv = Math.sqrt(variance) / mean;
            metrics.tempoStability = Math.max(0, Math.min(1, 1 - cv));
        }

        if (this.jumpHeights.length > 0 && this.groundLevel !== null) {
            const heightDiffs = this.jumpHeights.map(h => this.groundLevel - h);
            const maxHeight = Math.max(...heightDiffs);
            metrics.jumpHeight = Math.min(maxHeight, 0.3);
        }

        if (this.leftWristTrajectory.length > 0 && this.rightWristTrajectory.length > 0) {
            const avgSpread = [
                ...this.leftWristTrajectory.slice(-30),
                ...this.rightWristTrajectory.slice(-30)
            ].reduce((a, b) => a + b, 0) / 60;
            metrics.armSpread = Math.abs(avgSpread);
        }

        if (this.leftWristTrajectory.length > 10) {
            const recent = this.leftWristTrajectory.slice(-10);
            const variance = this.calculateVariance(recent);
            metrics.wristDrive = Math.max(0, 1 - variance * 10);
        }

        if (this.jumpInterval.length > 10) {
            const halfPoint = Math.floor(this.jumpInterval.length / 2);
            const firstHalf = this.jumpInterval.slice(0, halfPoint);
            const secondHalf = this.jumpInterval.slice(halfPoint);

            const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
            const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

            metrics.fatigueDrop = Math.max(0, (secondAvg - firstAvg) / firstAvg);
        }

        return metrics;
    }

    getLiveData() {
        return {
            count: this.jumpCount,
            tempo: this.jumpInterval.length > 0
                ? Math.round(60000 / (this.jumpInterval.slice(-5).reduce((a, b) => a + b, 0) / 5))
                : 0,
            inAir: this.inAir
        };
    }
}

window.JumpRopeAnalyzer = JumpRopeAnalyzer;
